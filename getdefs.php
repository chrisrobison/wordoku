#!/usr/bin/php
<?php
$words = array_map('trim', file("9plus.txt"));
print_r($words);

$cnt = count($words);

$out = array();
for ($i=0; $i<$cnt; $i++) {
    $word = $words[$i];

    $result = `curl --request GET --url https://wordsapiv1.p.rapidapi.com/words/$word/definitions --header 'x-rapidapi-host: wordsapiv1.p.rapidapi.com' --header 'x-rapidapi-key: 9fee8b3df9msh262d0d55f89d55ep17fbf6jsn0e327d49bcf5'`;

    $obj = json_decode($result);
    $out[$word] = $obj->definitions;
}

$json = json_encode($out);
file_put_contents("9plus-def.json", $json);
print_r($json);

?>
