<?php
include("include/init.php");
echoHeader("Comments");
?>

<form class="center" action="" method="post">
    <label for="name">Enter your name
        <input type="text" name="name">
    </label>
    <label for="content">
        Enter your message
        <input type="text" name="name">
    </label>
    <input type="submit" value="Submit">
</form>

<?php

echoFooter();