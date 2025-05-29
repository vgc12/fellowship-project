<?php

function debug_output($array){

    $clean = htmlspecialchars( print_r( $array, true ) );

    echo"<pre>".$clean."</pre>";

}