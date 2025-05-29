<?php

function getProject($projectId) {
    return db_query("SELECT * FROM projects WHERE project_id = $projectId") -> fetch();
}

function getProjects(): array
{
    return db_query("SELECT * FROM projects ORDER BY project_id DESC") -> fetchAll();
}