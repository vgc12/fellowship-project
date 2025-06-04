<?php
function echoHeader($pageTitle): void
{
$header = "
<!DOCTYPE HTML>
<html lang='en'>
    <head>
        <meta charset='utf-8' name='viewport' content='width=device-width' />
        <title>$pageTitle</title>
        <link rel='stylesheet' href='style.css' />
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css'
         integrity='sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=='
          crossorigin='anonymous' referrerpolicy='no-referrer' />
          <script src='./include/dropdown.js' type='module' defer></script>
    </head>
    <body>
    <header>
    <h1>Zaid Abuisba</h1>
    <div class='dropdown'>
        <div id='dropdown-button' class='dropdown-icon-wrap' >
        
          <span class='dropdown-icon'>
          
            <i class='fa-regular fa-square-caret-down'></i>
   
          </span>
         
       
        </div>
        <div id='dropdown-content' class='dropdown-content none-display'>
            <nav class='navbar center'>
                <a href='index.php' target='_self'>Home</a>
                <a href='about.php' target='_self'>About Me</a>
                <a href='projects.php' target='_self'>Projects</a>
            </nav>
        </div>
    </div>
    </header>
    <div class='container center'>
";

    echo $header;
}

function getParagraph($body, $heading = null) : string{
    $output = "<div class='center'>";
    if($heading != null){
        $output .= "    
        <h2> $heading </h2>";
    }
    $output .= "
        <p class='summary center'>$body</p>
</div>";

    return $output;
}

function echoParagraph($body, $heading = null): void
{

    echo getParagraph($body, $heading);
}

function echoGrid($heading, $content): void
{
    $output = "<div class='center-justify'>
                    <h2>$heading</h2>
                        <div class='grid'>";
    foreach ($content as $item) {
        $output .= "<div><p>" . $item . "</p></div>";
    }
    $output .= "</div>
                </div>";

    echo $output;
}


//If you want a footer you can add one this is the bare minimum
function echoFooter(): void
{

    echo '</div>
</body>
</html>
	
	';
}