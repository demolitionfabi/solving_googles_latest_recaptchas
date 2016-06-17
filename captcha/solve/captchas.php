<?php
header('Access-Control-Allow-Origin: *');
ini_set('display_errors', 1);

$token = getValidToken();

// check that the parameter p is set correctly
/*if(isset($_GET['piece'])) {
	$piece = (int) $_GET['piece'];
}
else {
	die("Error detecting image: Parameter p is not set!");	
}
if($piece < 0 || $piece > 8) {
	die("Error detecting image: Parameter p must be between 0 and 8");
}*/

// check that the parameters u, c and k are set correctly
if(!isset($_GET['u']) || !isset($_GET['c']) || !isset($_GET['k'])) {
	die("Error detecting image: You need to set the parameters u, c and k.");
}
else {
	$filename = $_GET['u'] . "?c=" . $_GET['c'] . "&k=" . $_GET['k'];
}
// check that the parameter t is set correctly
if(!isset($_GET['t'])) {
	die("Error detecting image: The parameter t is not set.");
}
else {
	$searchString = $_GET['t'];
	$searchString = strtolower($searchString);
}





// Try to download the image at the parameter url
// make sure that you have write access to the folder where the crop.php is stored
$temp_location="file.jpg"; 
if(!copy($filename,$temp_location)){ 
	die("Error detecting image: File copy failed...");	
}

// Load the image and the dimensions
$size = getimagesize($temp_location);
if(!$image = open_image($size, $temp_location)) {
	die("Error detecting image: The image could not be loaded.");
}
// delete the temp file
//unlink($temp_location); 


$width = $size[0];
$height = $size[1];

$new_width = $width / 3;
$new_height = $height / 3;

$outputValue=array();
for($piece=0; $piece<9; $piece++) {
	$file_name_with_full_path = "/var/www/htdocs/captcha/solve/output" . $piece . ".jpg";
	$x = $new_width * ($piece % 3);
	$y = $new_height * floor($piece / 3);
	
	// Initialize the image
	$image_new = imagecreatetruecolor($new_width, $new_height);
	// create the new cropped image
	imagecopyresampled($image_new, $image, 0, 0, $x, $y, $new_width, $new_height, $new_width, $new_height);
	
	
	// Output
	//header('Content-Type: image/jpeg');
	imagejpeg($image_new, $file_name_with_full_path, 100);
	
	imagedestroy($image_new);
	
	
	
	$post = array('encoded_data'=>base64_encode(file_get_contents($file_name_with_full_path)));
	
	$s = curl_init(); 
	curl_setopt($s,CURLOPT_URL, "https://api.clarifai.com/v1/tag/"); 
	curl_setopt($s, CURLOPT_POST,1);
	curl_setopt($s, CURLOPT_POSTFIELDS, $post);
	curl_setopt($s,CURLOPT_HTTPHEADER,array("Authorization: Bearer $token")); 
	curl_setopt($s,CURLOPT_RETURNTRANSFER,true); 
	//curl_setopt($s,CURLOPT_FOLLOWLOCATION,$this->_followlocation); 
	//curl_setopt($s,CURLOPT_HEADER,true); 
	$returnValue = curl_exec($s); 
	$status = curl_getinfo($s,CURLINFO_HTTP_CODE); 
	curl_close($s);
	
	$jsonObject = json_decode($returnValue);
	$statusCode = $jsonObject->{'status_code'};
	if($statusCode!="OK") {
		$statusMsg = $jsonObject->{'status_msg'};
		die("Error detecting image: $statusMsg");
	}
	$outputClasses = $jsonObject->{'results'}[0]->{'result'}->{'tag'}->{'classes'};
	$outputProbs = $jsonObject->{'results'}[0]->{'result'}->{'tag'}->{'probs'};
	$isCorrectImage=false;
	$correctClass="";
	$allClasses=array();
	foreach ($outputClasses as $i => $outputClass) {
		$allClasses[] = $outputClass . " (" . round($outputProbs[$i] * 100,2) .  "%)";
		if(strpos($searchString,$outputClass) !== false) {
			$isCorrectImage=true;
			$correctClass = $outputClass . " (" . round($outputProbs[$i] * 100,2) .  "%)";
		}
	}
	
	$outputValue[] = array(
		'piece' => $piece,
		'isCorrectImage' => $isCorrectImage,
		'correctClass' => $correctClass,
		'allClasses' => $allClasses,
	);
}

imagedestroy($image);

die(json_encode($outputValue));






echo("Done.");


/**
* This function loads an image
*/
function open_image ($size, $file) {
    switch($size["mime"]){
        case "image/jpeg":
            $im = imagecreatefromjpeg($file); //jpeg file
            break;
        case "image/gif":
            $im = imagecreatefromgif($file); //gif file
            break;
        case "image/png":
            $im = imagecreatefrompng($file); //png file
            break;
        default: 
            $im=false;
            break;
    }
    return $im;
}

/**
* This function checks if the token in the token.txt is still valid. If not, it generates a new one and saves it in the token.txt
* @return: A valid token
*/
function getValidToken() {
	$token = file_get_contents ( "token.txt" );
	$s = curl_init(); 
	curl_setopt($s,CURLOPT_URL, "https://api.clarifai.com/v1/info/"); 
	curl_setopt($s,CURLOPT_HTTPHEADER,array("Authorization: Bearer $token")); 
	curl_setopt($s,CURLOPT_RETURNTRANSFER,true); 
	$returnValue = curl_exec($s); 
	curl_close($s);
	
	$jsonObject = json_decode($returnValue);
	$statusCode = $jsonObject->{'status_code'};
	if($statusCode == "TOKEN_INVALID" || $statusCode == "TOKEN_EXPIRED") {
		$post = array('grant_type'=>'client_credentials','client_id'=>'5p-VpIEoynxNgcGyDJpcOSb1FSwMaVES7-_BkT1y','client_secret'=>'3CBjpiVsiYXn7MVeM-yiPppinQhf7ECsepoatEGx');
		$s = curl_init(); 
		curl_setopt($s,CURLOPT_URL, "https://api.clarifai.com/v1/token/"); 
		curl_setopt($s, CURLOPT_POST,1);
		curl_setopt($s, CURLOPT_POSTFIELDS, $post);
		curl_setopt($s,CURLOPT_RETURNTRANSFER,true); 
		$returnValue = curl_exec($s); 
		curl_close($s);
		$jsonObject = json_decode($returnValue);
		$token = $jsonObject->{'access_token'};
		file_put_contents("token.txt", $token);
	}
	return $token;
}

?>