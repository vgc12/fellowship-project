<?php

function getAllPosts()
{
/*
    return [
        1 => [
            'post_id' => 1,
            'title' => 'Home',
            'body' => [
                'summary' => 'As a passionate student software developer from St. Louis Missouri with a focus on graphics 
                programming and game development. I explore graphics technologies like OpenGL and WebGPU to create
                immersive 2D/3D visualizations and real-time rendering projects. Whether developing game engines, GPU-driven
                simulations, or full-stack web apps, I thrive on solving complex problems with clean, efficient code. 
                Explore my projects to see technical depth, creativity, and a drive for innovation!',

                'languages' => [
                    'C#',
                    'C++',
                    'Javascript and Typescript',
                    'Python',
                    'Java',
                    'SQL'
                ],

                'software' => [
                    'Unity Engine',
                    'Godot Engine',
                    'Blender',
                    'Microsoft SQL Server',
                    'MySQL Workbench',
                    'Substance Painter'
                ],

                'libraries' => [
                    'Netcode for GameObjects',
                    'OpenGL',
                    'ASP.NET MVC',
                    'Entity Framework Core',
                    'WinForms',
                    'Windows Presentation Framework'
                ],
            ]

        ],
        2 => [
            'post_id' => 2,
            'title' => 'About',
            'body' => [
                'summary' => 'As a passionate student software developer from St. Louis Missouri with a focus on graphics
                programming and game development. I explore graphics technologies like OpenGL and WebGPU to create immersive
                2D/3D visualizations and real-time rendering projects. Whether developing game engines, GPU-driven simulations,
                or full-stack web apps, I thrive on solving complex problems with clean, efficient code. I am currently pursuing
                a Bachelor\'s degree in Computer Science at Maryville University of St. Louis,
                where I am honing my skills in software development and computer graphics.'
            ]
        ],
        3 => [
            'post_id' => 3,
            'title' => 'Projects',
            'body' => [
                'summaryGD' => 'Check out Sword Bound, Dye Drinker, or any of my mods on Nexus'
            ]
        ]

    ];
*/

    $posts = dbQuery("SELECT * FROM posts") -> fetchAll();

    return $posts;
}



function getPost($postId)
{

    return dbquery("SELECT * FROM posts WHERE postId = $postId") -> fetch();
    //return getAllPosts()[$postId-1];
}
