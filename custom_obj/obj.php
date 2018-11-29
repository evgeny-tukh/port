<?php

    function cyr2utf8 ($source)
    {
        return mb_convert_encoding ($source, 'UTF-8', 'Windows-1251');
    }

    function utf82cyr ($source)
    {
        return mb_convert_encoding ($source, 'Windows-1251', 'UTF-8');
    }

    function utf162cyr ($source)
    {
        return mb_convert_encoding ($source, 'Windows-1251', 'UTF-16');
    }

    class SerializableObj
    {
        public $id;
        public $name;

        public function __construct ()
        {
            $this->id    = 0;
            $this->name  = '';

            $this->tableName       = NULL;
            $this->insertFieldList = NULL;
            $this->updateFieldList = NULL;
        }

        protected function copyProperty ($source, $propName, $defValue = NULL)
        {
            $this->$propName = array_key_exists ($propName, $source) ? $source [$propName] : $defValue;
        }

        public function toJSON ()
        {
            return array ('id' => $this->id, 'name' => $this->name);
        }

        public function getFromSource ($source)
        {
            $this->copyProperty ($source, 'id', 0);
            $this->copyProperty ($source, 'name', '');
        }

        public function saveToDatabase ($db)
        {
        }

        public function rename ($db, $tableName)
        {
            $db->execute ("update $tableName set name='".$this->name."' where id=".$this->id);
        }

        public function getFromDatabase ($db, $id)
        {
        }
    }

    class UserObject extends SerializableObj
    {
        public $layerID;
        public $type;
        public $userType;
        public $props;
        public $userProps;
        public $points;
        public $userInfo;

        public function __construct ($layerID = 0)
        {
            parent::__construct ();

            $this->layerID     = $layerID;
            $this->type        = NULL;
            $this->userType    = NULL;
            $this->props       = array ();
            $this->userProps   = array ();
            $this->points      = array ();
            $this->attachments = array ();
            $this->userInfo    = NULL;
            $this->userInfoID  = 0;
        }

        public function rename ($db)
        {
            parent::rename ($db, 'objects');
        }

        public function getFromSource ($source)
        {
            parent::getFromSource ($source);

            $this->copyProperty ($source, 'type');
            $this->copyProperty ($source, 'userType');
            $this->copyProperty ($source, 'userInfoID', 0);

            $this->props       = array ();
            $this->userProps   = array ();
            $this->points      = array ();
            $this->attachments = array ();
            $this->userInfo    = NULL;

            foreach ($source ['properties'] as $propName => $propValue)
                array_push ($this->props, array ('name' => $propName, 'value' => $propValue));

            foreach ($source ['userProps'] as $propName => $propValue)
                array_push ($this->userProps, array ('name' => $propName, 'value' => $propValue));

            foreach ($source ['attachments'] as $attachment)
                array_push ($this->attachments, array ('name' => $attachment ['name'], 'data' => $attachment ['data']));

            if (array_key_exists ('points', $source) && $source ['points'])
            {
                foreach ($source ['points'] as $index => $point)
                    array_push ($this->points, array ('lat' => doubleval ($point ['lat']), 'lon' => doubleval ($point ['lon'])));
            }

            if (array_key_exists ('userInfo', $source) && $source ['userInfo'])
            {
                $this->userInfo = new InfoArray ();

                $this->userInfo->getFromSource ($source ['userInfo']);

                //$this->userInfoID = $this->userInfo->id;
            }
        }

        public function toJSON ()
        {
            $result = parent::toJSON ();

            $result ['type']        = $this->type;
            $result ['userType']    = $this->userType;
            $result ['points']      = $this->points;
            $result ['properties']  = $this->props;
            $result ['userProps']   = $this->userProps;
            $result ['attachments'] = $this->attachments;
            $result ['userInfo']    = $this->userInfo ? $this->userInfo->toJSON () : NULL;
            $result ['userInfoID']  = $this->userInfoID;

            return $result;
        }

        public function getFromDatabase ($db, $id)
        {
            $this->id = $id;

            $callback = function ($row, $db, $self) use ($id)
            {
                $self->name        = $row ['name'];
                $self->type        = intval ($row ['type']);
                $self->userType    = intval ($row ['userType']);
                $self->attachments = array ();
                $userInfoID        = array_key_exists ('userInfo', $row) ? intval ($row ['userInfo']) : 0;

                if ($userInfoID)
                {
                    $self->userInfo = new InfoArray ();

                    $self->userInfo->getFromDatabase ($db, $userInfoID);
                }
                else
                {
                    $self->userInfo = NULL;
                }
            };

            $db->processResult ("select name,type,userType,userInfo from objects where id=$id", $callback, $this);

            $callback = function ($row, $db, $self)
            {
                array_push ($self->points, array ('lat' => doubleval ($row ['lat']), 'lon' => doubleval ($row ['lon'])));
            };

            $db->enumResult ("select lat,lon from object_points where object=$id order by `order`", $callback, $this);

            $callback = function ($row, $db, $self)
            {
                //array_push ($self->props, array ('name' => $row ['name'], 'value' => $row ['value']));
                $self->props [$row ['name']] = $row ['value'];
            };

            $db->enumResult ("select name,value from object_props where object=$id", $callback, $this);

            $callback = function ($row, $db, $self)
            {
                //array_push ($self->userProps, array ('name' => $row ['name'], 'value' => $row ['value']));
                $self->userProps [$row ['name']] = $row ['value'];
            };

            $db->enumResult ("select name,value from object_user_props where object=$id", $callback, $this);

            $callback = function ($row, $db, $self)
            {
                array_push ($self->attachments, $row);
            };

            $db->enumResult ("select name,data from object_attachments where object=$id", $callback, $this);
        }

        public function saveToDatabase ($db)
        {
            $id       = $this->id;
            $name     = $this->name; //SerializableObj::cyr2utf8 ($this->name);
            $type     = $this->type;
            $userType = $this->userType;
            $userInfo = $this->userInfoID;
            $layerID  = $this->layerID;

            if (!$userInfo)
                $userInfo = 'null';

             if (!$userType)
                $userType = 'null';

           $db->execute ("delete from object_props where object=$id");
            $db->execute ("delete from object_user_props where object=$id");
            $db->execute ("delete from object_points where object=$id");
            $db->execute ("delete from object_attachments where object=$id");

            if ($id)
            {
                $db->execute ("update objects set name='$name',type=$type,userType=$userType,layer=$layerID,userInfo=$userInfo where id=$id");
            }
            else
            {
                $db->execute ("insert into objects(name,type,userType,layer,userInfo) values('$name',$type,$userType,$layerID,$userInfo)");

                $this->id = $db->insertID ();
            }

            $id = $this->id;

            foreach ($this->props as $prop)
            {
                $name  = $prop ['name'];
                $value = $prop ['value'];

                $db->execute ("insert into object_props(object,name,value) values($id,'$name','$value')");
            }

            foreach ($this->userProps as $prop)
            {
                $name  = $prop ['name'];
                $value = $prop ['value'];

                $db->execute ("insert into object_user_props(object,name,value) values($id,'$name','$value')");
            }

            $order = 0;

            foreach ($this->points as $point)
            {
                $lat = $point ['lat'];
                $lon = $point ['lon'];

                $db->execute ("insert into object_points(object,`order`,lat,lon) values($id,$order,$lat,$lon)");

                ++ $order;
            }

            foreach ($this->attachments as $attachment)
            {
                $name = $attachment ['name'];
                $data = $attachment ['data'];

                $db->execute ("insert into object_attachments(object,name,data) values($id,'$name','$data')");
            }
        }
    };

    class ObjectLayer extends SerializableObj
    {
        public $objects;

        public function __construct ()
        {
            parent::__construct ();

            $this->objects = array ();
        }

        public function rename ($db)
        {
            parent::rename ($db, 'layers');
        }

        public function getFromSource ($source)
        {
            parent::getFromSource ($source);

            $this->objects = array ();

            foreach ($source ['objects'] as $objectDesc)
            {
                $object = new UserObject ($this->id);

                $object->getFromSource ($objectDesc);

                array_push ($this->objects, $object);
            }
        }

        public function toJSON ()
        {
            $result = parent::toJSON ();

            $result ['objects'] = array ();

            foreach ($this->objects as $object)
                array_push ($result ['objects'], $object->toJSON ());

            return $result;
        }

        public function getLayerObjectList ($db)
        {
            $objectIDs = array ();

            $callback = function ($row) use (&$objectIDs)
            {
                array_push ($objectIDs, intval ($row ['id']));
            };

            $db->enumResult ("select id from objects where layer=$this->id", $callback, $this);

            return $objectIDs;
        }

        public function getFromDatabase ($db, $id)
        {
            $callback = function ($row, $db, $self)
            {
                $self->id   = intval ($row ['id']);
                $self->name = $row ['name'];

                $objectIDs = $self->getLayerObjectList ($db);

                foreach ($objectIDs as $objectID)
                {
                    $object = new UserObject ($self->id);

                    $object->getFromDatabase ($db, $objectID);

                    array_push ($self->objects, $object);
                }
            };

            $db->enumResult ("select id,name from layers where id=$id", $callback, $this);
        }

        public function saveToDatabase ($db)
        {
            $name = $this->name; //SerializableObj::utf82cyr ($this->name);
            $id   = $this->id;

            if ($this->id)
            {
                $db->execute ("update layers set name='$name' where id=$id");
            }
            else
            {
                $db->execute ("insert into layers(name) values('$name')");

                $this->id = $db->insertID ();
            }

            foreach ($this->objects as $object)
            {
                $object->layerID = $this->id;

                $object->saveToDatabase ($db);
            }
        }
    };

    class InfoArray extends SerializableObj
    {
        public $items;

        public function __construct ()
        {
            parent::__construct ();

            $this->items = array ();
        }

        public function rename ($db)
        {
            parent::rename ($db, 'info_arrays');
        }

        public function getFromSource ($source)
        {
            parent::getFromSource ($source);

            $this->items = array ();

            foreach ($source ['items'] as $item)
                array_push ($this->items, array ('name' => $item ['name'], 'value' => $item ['value']));
        }

        public function toJSON ()
        {
            $result = parent::toJSON ();

            $result ['items'] = $this->items;

            return $result;
        }

        public function getFromDatabase ($db, $id)
        {
            $this->items = array ();

            $callback = function ($row, $db, $self)
            {
                $self->id    = intval ($row ['id']);
                $self->name  = $row ['name'];
            };

            $db->processResult ("select id,name from info_arrays where id=$id", $callback, $this);

            $callback = function ($row, $db, $self)
            {
                if ($row)
                    array_push ($self->items, array ('name' => $row ['name'], 'value' => $row ['value']));
            };

            $db->enumResult ("select name,value from info_items where array=$id order by `order`", $callback, $this);
        }

        public function saveToDatabase ($db)
        {
            $id   = $this->id;
            $name = $this->name;

            $db->execute ("delete from info_items where array=$id");

            if ($id)
            {
                $db->execute ("update info_arrays set name='$name' where id=$id");
            }
            else
            {
                $db->execute ("insert into info_arrays(name) values('$name')");

                $this->id = $db->insertID ();
            }

            $id = $this->id;

            $order = 0;

            foreach ($this->items as $item)
            {
                $name  = $item ['name'];
                $value = $item ['value'];

                $db->execute ("insert into info_items(array,name,value,`order`) values($id,'$name','$value',$order)");

                ++ $order;
            }
        }
    }
