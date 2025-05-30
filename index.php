<?php
include ('include/init.php');
echoHeader("Home");

echoParagraph("As a passionate student software developer from St. Louis
            Missouri with a focus on graphics programming and game
            development. I explore graphics technologies like OpenGL and
            WebGPU to create immersive 2D/3D visualizations and real-time
            rendering projects. Whether developing game engines, GPU-driven
            simulations, or full-stack web apps, I thrive on solving complex
            problems with clean, efficient code. Explore my projects to see
            technical depth, creativity, and a drive for innovation!", "Summary");


        echoGrid("Languages", [
            "C#",
            "C++",
            "Javascript and Typescript",
            "Python",
            "Java",
            "SQL"
        ]);

        echoGrid("Software", [
            "Unity Engine",
            "Godot Engine",
            "Blender",
            "Microsoft SQL Server",
            "MySQL Workbench",
            "Substance Painter"
        ]);

        echoGrid("Libraries, Frameworks, and API's", [
            "Netcode for GameObjects",
            "OpenGL",
            "ASP.NET MVC",
            "Entity Framework Core",
            "Win Forms",
            "Windows Presentation Framework"
        ]);

echoFooter();
?>