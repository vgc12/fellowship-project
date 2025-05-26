<?php


?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Magic 8 Ball</title>
</head>
<body>
<h1>Magic 8 Ball</h1>
<form method="POST" action="">
    <label for="question">Ask a question:</label>
    <input type="text" id="question" name="question" required>
    <button type="submit">Ask</button>
</form>

<?php


if ($_SERVER["REQUEST_METHOD"] != "POST") {
    return;

}

$answers = [
    "Yes",
    "No",
    "Maybe",
    "Ask again later",
    "Definitely",
    "Absolutely not",
];

$question = $_POST['question'];
$random_answer = $answers[array_rand($answers)];

echo "<h2>Your Question:</h2>
    <p>$question?</p>
    <h2>Magic 8 Ball Says:</h2>
    <p>$random_answer</p>";
?>
</body>