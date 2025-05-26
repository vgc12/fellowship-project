<?php
//php setup
$GRID_ROWS = 8;
$GRID_COLUMNS = 8;

//sets up the grid template column string to avoid manually type the size for 8 columns
function create_grid_template($column_amount, $size): string
{
    $grid_template_cols = "";
    for ($i = 0; $i < $column_amount; $i++) {
        $grid_template_cols .= " $size ";
    }
    return $grid_template_cols;
}


// returns a string of divs with alternating colors to put in a div element marked as a grid

function create_board($rows, $cols): string
{


    $board = "";

    // loop through every row
    for ($row = 0; $row < $rows; $row++) {
        //loop through every column in the row
        for ($col = 0; $col < $cols; $col++) {
            //Subtract the row from the column and mod 2, this causes the board to alternate and not just be columns full of one color
            $color = ($col - $row) % 2 == 0 ? "black" : "white";

            //create the element and set the color
            $element = "<div style = 'background-color: $color;'></div>";

            //add element to the board
            $board .= $element;
        }
    }
    return $board;
}
?>


<!DOCTYPE html>

<head>
    <meta charset="utf-8" name="viewport" content="width=device-width" />
    <title>Zaid's Page</title>


    <style>
        .grid {
            display: grid;
            gap: 0;
            justify-content: center;
            grid-template-columns: <?php echo create_grid_template($GRID_COLUMNS, "100px") ?>;
            width: 95%;
            border: 1px solid black;
        }

        .grid>div {
            width: 100px;
            height: 100px;
        }
    </style>
</head>

<div class="center-justify">

    <div class="grid">
        <?php 
        //Echo the chess board into the grid
        echo create_board($GRID_ROWS, $GRID_COLUMNS);
         ?>
    </div>
</div>