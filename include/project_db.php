<?php

function getProject($projectId) {
    return db_query("SELECT * FROM projects WHERE project_id = $projectId") -> fetch();
}

function getProjects(): array
{
    return db_query("SELECT * FROM projects ORDER BY project_id ASC") -> fetchAll();
}

function getProjectsByType($projectType): array
{
    return db_query("SELECT * FROM projects where project_type = '$projectType' ORDER BY project_id ASC") -> fetchAll();
}