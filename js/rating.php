<?php
//xml database file
$xmlFile = 'ratings.xml'; 

//generate unique user fingerprint
if (! isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $user = md5($_SERVER['REMOTE_ADDR']);
} else {
    $user = md5($_SERVER['HTTP_X_FORWARDED_FOR']);
}

if (isset ($_POST['song']) && isset ($_POST['name']) && isset ($_POST['set'])):
    $song = $_POST['song'];
    $name = $_POST['name'];
    $set = $_POST['set'];
    
    if (file_exists($xmlFile)):
        update_xml($user, $song, $name, $set, $xmlFile);
    else:
        create_xml($user, $song, $name, $set, $xmlFile);
    endif;
endif;


//<rating user="xcsdfs2342dsfs" song="tralala" name="Overall Rating" set="5" />
function create_xml($user, $song, $name, $set, $xmlFile){
    $xml = new DOMDocument( '1.0', 'utf-8' );
    $xml->preserveWhiteSpace = true;
    $xml->formatOutput = true;
    $root = $xml->createElement('ratings');
    $root = $xml->appendChild($root);
    addnode_xml($xml, $user, $song, $name, $set, $xmlFile);
}

function update_xml($user, $song, $name, $set, $xmlFile){
    $xml = new DOMDocument( '1.0', 'utf-8' );
    $xml->preserveWhiteSpace = true;
    $xml->load($xmlFile);
    $xml->formatOutput = true;
    $found = false;
    foreach($xml->getElementsByTagName('rating') as $item) {
        if ($item->getAttribute('user') == $user && $item->getAttribute('song') == $song && $item->getAttribute('name') == $name):
            $found = true;
            $item->setAttribute('set', $set);
        endif;
    }
    if (!$found):
        addnode_xml($xml, $user, $song, $name, $set, $xmlFile);
    else:
        save_xml($xml, $xmlFile);
    endif;
}

function addnode_xml($xml, $user, $song, $name, $set, $xmlFile){
    $root = $xml->documentElement;
    
    $rating = $xml->createElement('rating');

    $domUser = $xml->createAttribute('user');
    $domUser->value = $user;
    $rating->appendChild($domUser);
    
    $domSong = $xml->createAttribute('song');
    $domSong->value = $song;
    $rating->appendChild($domSong);
    
    $domName = $xml->createAttribute('name');
    $domName->value = $name;
    $rating->appendChild($domName);
    
    $domSet = $xml->createAttribute('set');
    $domSet->value = $set;
    $rating->appendChild($domSet);
    
    $root->appendChild($rating);
    
    save_xml($xml, $xmlFile);
}

function save_xml($xml, $xmlFile){
    $xml->saveXML();
    $xml->save($xmlFile);    
}   

?>