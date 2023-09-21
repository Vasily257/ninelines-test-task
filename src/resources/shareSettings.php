<?php

$protocol = $_SERVER['PROTOCOL'] = isset($_SERVER['HTTPS']) && !empty($_SERVER['HTTPS']) ? 'https' : 'http';
$host = $protocol . '://' . $_SERVER['HTTP_HOST'];
$title = 'Resume of Vasily';
$description = 'Summary of my experience, education and motivation';
$image = $host . '/images/guy-with-laptop.png';

// Uncomment the code below and fill in the pages if necessary
// $pages = [
// 	'/page/1' => [
// 		'title' => '',
// 		'description' => '',
// 		'image' => '/images/',
// 	],
// ];

$page = @$pages[$_SERVER['REQUEST_URI']];

if ($page) {
	$title = !is_null(@$page['title']) ? $page['title'] : $title;
	$description = !is_null(@$page['description']) ? $page['description'] : $description;
	$image = !is_null(@$page['image']) ? $host . $page['image'] : $image;
}

?>
