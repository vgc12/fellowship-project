<?php
    $input1 = 1;
    $input2 = 2;

    $message = "";
    if($input1 < $input2){
        $message = "less than";
    }
    else if ($input1 == $input2){
        $message = "the same as";
    }
    else{
        $message = "greater than";
    }

    echo "input 1 is " .$message . "input2" ;