<?php

require_once 'dbconfig.php';

class Database
{
    const DATA_TYPE_INT = 1;
    const DATA_TYPE_FLOAT = 2;
    const DATA_TYPE_DOUBLE = 3;
    const DATA_TYPE_STRING = 4;
    
    var $connection;
    
    public function Database ()
    {
        global $host, $userName, $password, $dbName, $port;
        
        $this->connection = new mysqli ($host, $userName, $password, $dbName, $port);
        
        if ($this->connection->connect_errno)
            die ("Unable to open database, error ".$this->connection->connect_errno." (".$this->connection->connect_error.")");

        //$this->execute ("SET NAMES cp1251");
        $this->execute ("SET NAMES utf8");
    }
    
    public function insertID ()
    {
        return $this->connection->insert_id;
    }
    
    public function affectedRows ()
    {
        return $this->connection->affected_rows;
    }
    
    public function close ()
    {
        if ($this->connection)
            $this->connection->close ();
    }

    function execute ($query)
    {
        return $this->connection->query ($query);
    }
    
    function getSingleValue ($table, $field, $whereClause = null, $dataType = self::DATA_TYPE_INT)
    {
        $query = "select $field from $table";
        
        if ($whereClause)
            $query = "$query where $whereClause";
        
        $result = $this->connection->query ($query);
        $value  = NULL;

        if ($result)
        {
            $row = $result->fetch_row ();
            
            if ($row && $row [0])
            {
                $value = $row [0];
                
                switch ($dataType)
                {
                    case self::DATA_TYPE_INT:
                        $value = intval ($value); break;
                    
                    case self::DATA_TYPE_FLOAT:
                        $value = floatval ($value); break;
                    
                    case self::DATA_TYPE_DOUBLE:
                        $value = doubleval ($value); break;
                }
            }
            
            $result->close ();
        }
        
        return $value;
    }
    
    function quickInsert ($table, $pairs)
    {
        $values = array_map ('mysql_real_escape_string', array_values ($pairs));
        $keys   = array_keys ($pairs);
        $query  = 'insert into `'.$table.'` (`'.implode ('`,`', $keys).'`) VALUES (\''.implode ('\',\'', $values).'\')';
        
        if ($this->connection->query ($query))
        {
            $result = $this->connection->insert_id;
        }
        else
        {
            $result = null;
        }
        
        return $result;
    }
    
    public function isAdmin ($userID)
    {
        $result  = $this->execute ("select level from users where id=$userID");
        $isAdmin = FALSE;
        
        if ($result)
        {
            $row = $result->fetch_row ();
            
            if (is_array ($row) && count ($row) > 0)
                $isAdmin = boolval ($row [0]);

            $result->close ();
        }
        
        return $isAdmin;
    }
    
    public function getFeatures ($userID)
    {
        $result   = $this->execute ("select features from users where id=$userID");
        $features = 0;
        
        if ($result)
        {
            $row = $result->fetch_row ();
            
            if (is_array ($row) && count ($row) > 0)
                $features = intval ($row [0]);

            $result->close ();
        }
        
        return $features;
    }
    
    public function getInitialPos ($userID)
    {
        $query  = "select initial_lat,initial_lon from users where id=$userID and initial_lat is not null and initial_lon is not null";
        $result = NULL;
        $cb     = function ($row) use (&$result)
                  {
                      $result = ['lat' => doubleval ($row ['initial_lat']), 'lon' => doubleval ($row ['initial_lon'])];
                  };

        $this->processResult ($query, $cb);
        
        return $result;
    }
    
    // Returns the user ID if the user name/pass is correct or null otherwise
    public function checkCredentials ($userName, $password)
    {
        $userName = sha1 ($userName);
        $password = sha1 ($password);
        $query    = "select * from users where sha1(username)='$userName' and sha1(password)='$password'";
        $result   = $this->connection->query ($query);
        $id       = NULL;
        $flags    = NULL;

        if ($result)
        {
            $row = $result->fetch_row ();
            
            if (is_array ($row) && count ($row) > 0)
            {
                $id    = intval ($row [0]);
                $flags = intval ($row [1]);
            }

            $result->close ();
        }

        return array ("id" => $id, "flags" => $flags);
    }
    
    function enumResult ($query, $callback, &$param = NULL)
    {
        $result = $this->connection->query ($query);

        if ($result)
        {
            while ($row = $result->fetch_assoc ())
                $callback ($row, $this, $param);

            $result->close ();
        }
    }
    
    function processResult ($query, $callback, &$param = NULL)
    {
        $result = $this->connection->query ($query);

        if ($result)
        {
            if ($row = $result->fetch_assoc ())
                $callback ($row, $this, $param);

            $result->close ();
        }
    }

}
