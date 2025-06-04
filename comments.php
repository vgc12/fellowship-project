<?php
include ("include/init.php");
echoHeader("Comments");
$comments = getComments();
echo "<div class=''><div class='comments-container center center-justify'>";
foreach ($comments as $comment){
    $name = $comment['name'];
    $content = $comment['content'];
    echo "<div class='comment'>
            <div class='comment-name'>".$name."</div>". "
            <div  class='comment-content'>" .$content."</div>
        </div>";
}

function insert_comment($name, $comment){
    $now = date_create();
    $dateTimeString = date_format($now, "Y-m-d H:i:s");

}


?>


    <form class="comment-form">
        <div>
            <label for="name">Enter your name </label>
                <div>
                    <input type="text" name="name">
                </div>

        </div>
        <div >
           <div <label >Enter text here
            </label>
            </div>
            <textarea class="comment-text" name="content"></textarea>
        </div>
        <div>
            <input type="submit" value="Submit">
        </div>
    </form>
    </div>
</div>
<?php
echoFooter();