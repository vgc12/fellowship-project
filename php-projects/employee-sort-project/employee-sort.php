<?php 

$employees = [
    "Alana Joy Morrison",
    "Zaid Abuisba",
    "Bracken King",
    "William Zackaria Shoki",
    "Casey Mason",
    "Tyler King",
    "Elle Jones",
    "Ther Matthews",
    "Emily Schwab",
    "Ruth Durrell",
    "Emma Quirk-Durben",
    "Robert Landis",
    "Eunice Koo",
    "Reno Dubois",
    "Eva Jeliazkova",
    "Mitchell Manar",
    "Grady Randolph",
    "Michael Wuellner",
    "Hamida Mohamed",
    "Maya Nepos",
    "Isabelle Cox",
    "Maggie Conroy",
    "J. Yang",
    "Lauren Zhao"
];

asort($employees,SORT_STRING);

foreach ($employees as $employee) {
    echo "<div>$employee</div>";
}