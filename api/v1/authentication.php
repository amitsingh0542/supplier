<?php 
$app->get('/session', function() {
    $db = new DbHandler();
    $session = $db->getSession();
    $response["uid"] = $session['uid'];
    $response["email"] = $session['email'];
    $response["name"] = $session['name'];
    echoResponse(200, $session);
});


$app->get('/tps_dashboard', function(){
    $response = array();
    $db = new DbHandler(); 
    $supplier = $db->getMultipleRecord("select * from supplier_auth");
    
    if ($supplier != NULL) {
        $response = $supplier;
    } else {
        $response['status'] = "error";
        $response['message'] = 'No records are available for supliers';
    }
    echoResponse(200, $response);
});

$app->post('/supplierDelete', function() use ($app){
    $response = array();
    $r = json_decode($app->request->getBody());
    $db = new DbHandler();
    $id =  $r->supplier->id;
    
    $supplier = $db->deleteRecord("delete from supplier_auth where sid='$id'");
    $response["status"] = "success";
    $response["message"] = "Supplier account deleted successfully";

    echoResponse(200, $response);
});

$app->post('/login', function() use ($app) {
    require_once 'passwordHash.php';
    $r = json_decode($app->request->getBody());
    verifyRequiredParams(array('email', 'password'),$r->customer);
    $response = array();
    $db = new DbHandler();
    $password = $r->customer->password;
    $email = $r->customer->email;
    $user = $db->getOneRecord("select uid,name,password,email,created from customers_auth where phone='$email' or email='$email'");
    if ($user != NULL) {
        if(passwordHash::check_password($user['password'],$password)){
        $response['status'] = "success";
        $response['message'] = 'Logged in successfully.';
        $response['name'] = $user['name'];
        $response['uid'] = $user['uid'];
        $response['email'] = $user['email'];
        $response['createdAt'] = $user['created'];
        if (!isset($_SESSION)) {
            session_start();
        }
        $_SESSION['uid'] = $user['uid'];
        $_SESSION['email'] = $email;
        $_SESSION['name'] = $user['name'];
        } else {
            $response['status'] = "error";
            $response['message'] = 'Login failed. Incorrect credentials';
        }
    }else {
            $response['status'] = "error";
            $response['message'] = 'No such user is registered';
        }
    echoResponse(200, $response);
});
$app->post('/signUp', function() use ($app) {
    $response = array();
    $r = json_decode($app->request->getBody());
    verifyRequiredParams(array('email', 'name', 'password'),$r->customer);
    require_once 'passwordHash.php';
    $db = new DbHandler();
    $phone = $r->customer->phone;
    $name = $r->customer->name;
    $email = $r->customer->email;
    $address = $r->customer->address;
    $password = $r->customer->password;
    $isUserExists = $db->getOneRecord("select 1 from customers_auth where phone='$phone' or email='$email'");
    if(!$isUserExists){
        $r->customer->password = passwordHash::hash($password);
        $tabble_name = "customers_auth";
        $column_names = array('phone', 'name', 'email', 'password', 'city', 'address');
        $result = $db->insertIntoTable($r->customer, $column_names, $tabble_name);
        if ($result != NULL) {
            $response["status"] = "success";
            $response["message"] = "User account created successfully";
            $response["uid"] = $result;
            if (!isset($_SESSION)) {
                session_start();
            }
            $_SESSION['uid'] = $response["uid"];
            $_SESSION['phone'] = $phone;
            $_SESSION['name'] = $name;
            $_SESSION['email'] = $email;
            echoResponse(200, $response);
        } else {
            $response["status"] = "error";
            $response["message"] = "Failed to create customer. Please try again";
            echoResponse(201, $response);
        }            
    }else{
        $response["status"] = "error";
        $response["message"] = "An user with the provided phone or email exists!";
        echoResponse(201, $response);
    }
});
$app->post('/signUpSupplier', function() use ($app) {
    $response = array();
    $r = json_decode($app->request->getBody());
    verifyRequiredParams(array('name', 'orgname', 'url', 'pan'),$r->supplier);
    
    $db = new DbHandler();
    $name = $r->supplier->name;
    $orgtype = $r->supplier->orgtype;
    $orgname = $r->supplier->orgname;
    $url = $r->supplier->url;
    $pan = $r->supplier->pan;
    $isSupplierExists = $db->getOneRecord("select 1 from supplier_auth where name='$name' or orgname='$orgname'");
    if(!$isSupplierExists){
        $tabble_name = "supplier_auth";
        $column_names = array('name', 'orgtype', 'orgname', 'url', 'pan');
        $result = $db->insertIntoTable($r->supplier, $column_names, $tabble_name);
        if ($result != NULL) {
            $response["status"] = "success";
            $response["message"] = "Supplier account created successfully";
            echoResponse(200, $response);
        } else {
            $response["status"] = "error";
            $response["message"] = "Failed to create supplier. Please try again";
            echoResponse(201, $response);
        }            
    }else{
        $response["status"] = "error";
        $response["message"] = "A suplier with the provided name or organization name exists!";
        echoResponse(201, $response);
    }
});

$app->post('/supplierAddress', function() use ($app) {
    $response = array();
    $r = json_decode($app->request->getBody());
    verifyRequiredParams(array('address1', 'email', 'city', 'state', 'country', 'zipcode', 'phone1', 'mobile'),$r->supplier);
    
    $db = new DbHandler();
    $address1 = $r->supplier->address1;
    $address2 = $r->supplier->address2;
    $email = $r->supplier->email;
    $city = $r->supplier->city;
    $state = $r->supplier->state;
    $country = $r->supplier->country;
    $zipcode = $r->supplier->zipcode;
    $phone1 = $r->supplier->phone1;
    $phone2 = $r->supplier->phone2;
    $mobile = $r->supplier->mobile;
    $sid = $r->supplier->sid;
    $tabble_name = "supplier_address";
    $column_names = array('address1', 'address2', 'email', 'city', 'state', 'country', 'zipcode', 'phone1', 'phone2', 'mobile', 'sid');
    $result = $db->insertIntoTable($r->supplier, $column_names, $tabble_name);
    if ($result != NULL) {
        $response["status"] = "success";
        $response["message"] = "Supplier address added successfully";
        echoResponse(200, $response);
    } else {
        $response["status"] = "error";
        $response["message"] = "Failed to add supplier address. Please try again";
        echoResponse(201, $response);
    }            
});
$app->get('/logout', function() {
    $db = new DbHandler();
    $session = $db->destroySession();
    $response["status"] = "info";
    $response["message"] = "Logged out successfully";
    echoResponse(200, $response);
});
?>