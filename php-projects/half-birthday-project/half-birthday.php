<?php
$fellows_birthdays = [
    "Alana Joy Morrison" => "July 20",
    "Zaid Abuisba" => "September 6",
    "William Zackaria Shoki" => "September 20",
    "Hamida Mohamed" => "August 8",
    "Isabelle Cox" => "September 7",
];


foreach ($fellows_birthdays as $key => $value) {
    // Dont have years, so im using current year
    $date = date_create($value. ", " . date("Y"));
    // Add 6 months to the date to get the half birthday
    date_add($date, date_interval_create_from_date_string("6 months"));
    // Format the date to just show the month and day
    $half_birthday = date_format($date, "F j");
    // Output the name and the half birthday
    echo "<div>$key's Half Birthday is on $half_birthday</div>";
}
