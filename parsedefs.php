#!/usr/bin/php
<?php
$words = json_decode(file_get_contents("9plus.json"));
$defs = json_decode(file_get_contents("9plus-def.json"));
print_r($words);
print_r($defs);
$out = array();

foreach ($defs as $idx=>$key) {
    if (count($key)) {
        $out[$idx] = $key;
    }
}
$words = array_keys($out);
print_r($out);
$jsonwords = json_encode($words);
$jsondefs = json_encode($out);
file_put_contents("new9plus.json", $jsonwords);
file_put_contents("new9plus-def.json", $jsondefs);
print $jsonwords."\n";
print $jsondefs."\n";

?>
