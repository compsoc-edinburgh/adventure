<?php
# Append the email to the file emails.txt
$myfile = fopen("/etc/adventure/emails.txt", "a") or die("Unable to open file!");
$txt = $_POST["email"] . "\n";
fwrite($myfile, $txt);
fclose($myfile);

echo "We'll let you know when we're launching!! Latest 1/12/2024.\n";
echo "You can also keep an eye on CompSoc social media for updates!";

?>
