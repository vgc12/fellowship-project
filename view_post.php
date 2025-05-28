<?php
include("include/init.php");

if (isset($_REQUEST['post_id'])) {

    $post = getPost($_REQUEST['post_id']);


    echoHeader($post['title']);

    $body = json_decode($post["body"], true);


    switch ($post['postId']) {
        case 1:


            echoParagraph($body['summary'], "Summary");

            echoGrid("Languages", $body['languages']);

            echoGrid("Software", $body['software']);

            echoGrid("Libraries, Frameworks, And API's", $body['libraries']);

            break;
        case 2:
            echoParagraph($body['summary'], "Summary");
            break;
        case 3:
            echoParagraph($body['summaryGD'], "Game Development");

            echo '<div class="games center">
                    <div>
                        <iframe frameborder="0" src="https://itch.io/embed/3525448?border_width=2&amp;bg_color=364652&amp;fg_color=cdc5b4&amp;link_color=cdc5b4&amp;border_color=cdc5b4" width="554" height="169">
                            <a href="https://vgc12.itch.io/sword-bound">Sword Bound by vgc12</a>
                        </iframe>
                    </div>
                    <br>
                    <div>
                        <iframe frameborder="0" src="https://itch.io/embed/2906922?border_width=3&amp;bg_color=364652&amp;fg_color=cdc5b4&amp;link_color=cdc5b4&amp;border_color=cdc5b4" width="556" height="171">
                            <a href="https://vgc12.itch.io/dye-drinker">Dye Drinker by vgc12</a>
                        </iframe>
                    </div>
                </div>';

    }

    echoFooter();
}

