<?php

require_once 'dbconfig.php';

class DbQuery
{
    public $text;
    public $params;

    public static function buildParamArray ($args)
    {
        $params = [];

        foreach ($args as $arg)
        {
            if ($arg {1} === ':')
            {
                $type  = $arg {0};
                $value = substr ($arg, 2);
            }
            else
            {
                $type  = 's';
                $value = $arg;
            }

            array_push ($params, ['type' => $type, 'value' => $value]);
        }

        return $params;
    }

    public function __construct ($text, ...$args)
    {
        $this->text   = $text;
        $this->params = DbQuery::buildParamArray ($args);
    }
}

class Database
{
    const DATA_TYPE_INT = 1;
    const DATA_TYPE_FLOAT = 2;
    const DATA_TYPE_DOUBLE = 3;
    const DATA_TYPE_STRING = 4;

    const OBJECT_TYPE_USER = 1;
    const OBJECT_TYPE_FLEET = 2;
    const OBJECT_TYPE_VESSEL = 3;

    var $extendedMode;
    var $connection;
    var $version;
    var $affectedRowsNum;
        
    public function Database ()
    {
        global $host, $userName, $password, $dbName, $port;

        $affectedRowsNum = -1;
        
        $this->version = explode ('.', phpversion ());
        
        foreach ($this->version as $key => $value)
            $this->version [$key] = intval ($value);
        
        $this->extendedMode = FALSE;
        $this->distributors = array ();
        $this->connection   = new mysqli ($host, $userName, $password, $dbName, $port);
        
        if ($this->connection->connect_errno)
            die ("Unable to open database, error ".$this->connection->connect_errno." (".$this->connection->connect_error.")");
    }

    public function errorCode ()
    {
        return $this->connection->errno;
    }
    
    public function errorText ()
    {
        return $this->connection->error;
    }
    
    public function beginTrans ($name = '')
    {
        if ($this->extendedMode)
            $this->connection->begin_transaction (MYSQLI_TRANS_START_READ_WRITE, $name);
        else
            $this->connection->begin_transaction ();
    }
    
    public function commit ($name = '')
    {
        if ($this->extendedMode)
            $this->connection->commit ($name);
        else
            $this->connection->commit ();
    }
    
    public function rollback ($name = '')
    {
        if ($this->extendedMode)
            $this->connection->rollback ($name);
        else
            $this->connection->rollback ();
    }

    public function enableAutoCommit ($enable)
    {
        $this->connection->autocommit ($enable);
    }    
    
    public function insertID ()
    {
        return $this->connection->insert_id;
    }
    
    public function affectedRows ()
    {
        return $this->connection->affected_rows >= 0 ? $this->connection->affected_rows : $this->affectedRowsNum;
    }
    
    public function close ()
    {
        if ($this->connection)
            $this->connection->close ();
    }

    function execute ($query, $echoQueryIfFault = FALSE)
    {
        $res = $this->connection->query ($query);

        if ($echoQueryIfFault && $this->connection->errno)
            echo "<br/>Query '".$query."' caused an error '".$this->connection->error."'<br/>";

        $this->affectedRowsNum = $this->connection->affected_rows;

        return $res;
    }
    
    function executeParamList ($query, $getResult, ...$args)
    {
        $params = DbQuery::buildParamArray ($args);

        return $this->executeParams ($query, $params, $getResult);
    }

    function executeParams ($query, $params, $getResult = FALSE)
    {
        $statement = $this->connection->prepare ($query);
        $types     = '';
        $values    = [];

        if (!$statement)
             die ("SQL Error: {$this->connection->errno} - {$this->connection->error}");

        foreach ($params as $param)
        {
            $types .= $param ['type'];

            array_push ($values, $param ['value']);
        }

        $statement->bind_param ($types, ...$values);

        $statement->execute ();

        $this->affectedRowsNum = $statement->affected_rows;

        if ($getResult)
            $result = $statement->get_result ();
        else
            $result = NULL;

        $statement->close ();

        return $result;
    }
    
    function executeParam ($query, $paramValue, $paramType = 'i', $getResult = FALSE)
    {
        $statement = $this->connection->prepare ($query);

        $statement->bind_param ($paramType, $paramValue);
        $statement->execute ();

        $this->affectedRowsNum = $statement->affected_rows;

        if ($getResult)
            $result = $statement->get_result ();
        else
            $result = NULL;

        $statement->close ();

        return $result;
    }

    function enumResult ($query, $callback, $param = NULL)
    {
        $result = $this->connection->query ($query);

        if ($result)
        {
            while ($row = $result->fetch_assoc ())
                $callback ($row, $this, $param);

            $result->close ();
        }
    }
    
    function enumResultParams ($query, $params, $callback, $param = NULL)
    {
        $result = $this->executeParams ($query, $params, TRUE);

        if ($result)
        {
            while ($row = $result->fetch_assoc ())
                $callback ($row, $this, $param);

            $result->close ();
        }
    }
    
    function enumQueryResult ($query, $callback, $param = NULL)
    {
        $result = $this->executeParams ($query->text, $query->params, TRUE);

        if ($result)
        {
            while ($row = $result->fetch_assoc ())
                $callback ($row, $this, $param);

            $result->close ();
        }
    }
    
    function processResult ($query, $callback, $param = NULL)
    {
        $result = $this->connection->query ($query);

        if ($result)
        {
            if ($row = $result->fetch_assoc ())
                $callback ($row, $this, $param);

            $result->close ();
        }
    }

    function processResultParams ($query, $params, $callback, $param = NULL)
    {
        $result = $this->executeParams ($query, $params, TRUE);

        if ($result)
        {
            if ($row = $result->fetch_assoc ())
                $callback ($row, $this, $param);

            $result->close ();
        }
    }
    
    function processQueryResult ($query, $callback, $param = NULL)
    {
        $result = $this->executeParams ($query->text, $query->params, TRUE);

        if ($result)
        {
            if ($row = $result->fetch_assoc ())
                $callback ($row, $this, $param);

            $result->close ();
        }
    }
    
    function getSingleValue ($table, $field, $whereClause = null, $dataType = self::DATA_TYPE_INT)
    {
        $query = "select ".$field." from ".$table;
        
        if ($whereClause)
            $query = $query." where ".$whereClause;
        
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
        $query   = "select level from users where id=?";
        $result  = $this->executeParams ($query, [['type' => 'i', 'value' => intval ($userID)]], TRUE);
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
        $query    = "select features from users where id=?";
        $result   = $this->executeParams ($query, [['type' => 'i', 'value' => intval ($userID)]], TRUE);
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
    
    // Returns the user ID if the user name/pass is correct or null otherwise
    public function checkCredentials ($userName, $password)
    {
        $query  = 'select id from users where username=? and password=?';
        $result = $this->executeParams ($query, [['type' => 's', 'value' => $userName], ['type' => 's', 'value' => $password]], TRUE);
        $id     = NULL;

        if ($result)
        {
            $row = $result->fetch_row ();
            
            if (is_array ($row) && count ($row) > 0)
                $id = intval ($row [0]);
            else
                $id = NULL;

            $result->close ();
        }
        
        return $id;
    }    
}
