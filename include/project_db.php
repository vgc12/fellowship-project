<?php

function getProject($projectId) {
    return db_query("SELECT * FROM projects WHERE project_id = $projectId") -> fetch();
}




function getWebProjects() : array{
    return db_query("SELECT * FROM projects WHERE project_type = 'Web' ORDER BY project_id ASC") -> fetchAll();
}
function getGameProjects(): array
{
    return db_query("SELECT * FROM projects ORDER BY project_id ASC") -> fetchAll();
}