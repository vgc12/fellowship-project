<?php
$employees = [
    [
        "name" => "Arlo",
        "id" => 1234,
    ],
    [
        "name" => "Bella",
        "id" => 1111,
    ],
    [
        "name" => "Ciara",
        "id" => 1222,
    ],
];

$count = 1;

foreach ($employees as $employee) {
    echo "
            <div style='font-size:12px; color: #999;'>Employee #" . $count . "</div>" .
        "<div style='font-size:16px; font-weight:bold; margin-bottom:20px;'>" . $employee['name']. " ID:". $employee['id'] . "</div>"
    ;
    $count++;
}
