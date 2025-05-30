<?php
include("include/init.php");
$comments = getComments();
echo " All comments";

foreach($comments as $comment){
    $name = $comment['name'];
    $content = $comment['content'];
    echo "<div><strong>".$name."</strong>:".$content."</div>";

}
function insertComment($name, $comment)
{
    $now = date_create();
    $dateTimeString = date_format($now, "Y-m-d H:i:s" );

    db_query("INSERT INTO comments(content, datePosted, name) VALUES (:comment, :dateTimeString, :name)", ['name' => $name,'dateTimeString'=>$dateTimeString, 'comment' => $comment]);

}

if(isset($_REQUEST['name']) && isset($_REQUEST['comment'])){
    insertComment($_REQUEST['name'], $_REQUEST['comment']);
    header("Location: form_practice.php");
    exit();

}
?>

<html lang="">
    <form action="" method="post">

        Name: <input type="text" name="name">
        Comment: <input type="text" name="comment">
        <input type="submit">
    </form>
</html>
