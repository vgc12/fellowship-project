<?php
function getComments(){
    $comments = db_query('SELECT * FROM comments') -> fetchAll();
    return $comments;
}