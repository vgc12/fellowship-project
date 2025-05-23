<?php
    $randomValue = rand(-100, 100);
    
    if($randomValue > 0){
        $description = "positive";
    }
    else if ($randomValue < 0)
    {
        $description = "negative";
    }
    else{
        $description = "zero";
    }
    echo "The random value today is ". $randomValue . " which is " .$description;