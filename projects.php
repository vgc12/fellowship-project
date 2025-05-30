<?php

include("include/init.php");
echoHeader("Projects");

$gameProjects = getProjects();


$gridItems = [];
foreach ($projects as $project){

    $projectName = $project['project_name'];
   array_push( $gridItems, getParagraph($project['project_description'], $projectName). "<img src='assets/img/picture". $project["project_id"].".gif'></img>");
}

echoGrid("Game Development Projects", $gridItems);

echoFooter();

?>