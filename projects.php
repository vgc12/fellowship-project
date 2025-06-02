<?php

include("include/init.php");
echoHeader("Projects");

enum Project_Type: string {
    case GAME = "Game";
    case WEB = "Web";
    case DESKTOP = "Desktop";
    case COMMAND_LINE = "Command Line";

}

//loop through enum, find projects by each case
foreach (Project_Type::cases() as $type) {
    //getting project from the database by the project type
    $projects = getProjectsByType($type -> value);

    // if no projects of that type exist continue
    if(count($projects) == 0) continue;

    //store html that will be rendered in an array
    $gridItems = [];

    foreach ($projects as $project) {
        $projectName = $project['project_name'];
        $gridItems[] = getParagraph($project['project_description'], $projectName) . "<img src='assets/img/picture" . $project["project_id"] . ".gif'></img>";
    }

    echoGrid($type->value." Development Projects", $gridItems);
}


echoFooter();

?>