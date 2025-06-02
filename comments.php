<?php
include ("include/init.php");
echoHeader("Comments");

?>
    <div class="">
    <div class="comments-container center center-justify">

    <form class="comment-form">
        <div>
            <label for="name">Enter your name
                <input type="text" name="name">
            </label>
        </div>
        <div >
           <div <label >Enter text here
            </label></div>
            <textarea class="comment-content" name="content"></textarea>
        </div>
        <div>
            <input type="submit" value="Submit">
        </div>
    </form>
    </div>
    </div>
<?php
echoFooter();