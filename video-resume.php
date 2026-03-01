<?php

/**
* Plugin Name: Video Resume
* Plugin URI: http://www.phildesigns.com
* Description: This plugin uses user based meta to restore the last paused position of Vimeo and YouTube videos.
* Version: 1.0.1
* Author: phil.designs | Phillip De Vita
* Author URI: http://www.phildesigns.com
* License: GPL2
*/

if ( !defined( 'ABSPATH' ) ) exit; // Do not allow direct access

define( 'VR_VERSION', '1.0' );
define( 'VR_URL', untrailingslashit(plugin_dir_url( __FILE__ )) );
define( 'VR_PATH', dirname(__FILE__) );

// Add JS
function plyr_enqueue_scripts() {

		wp_enqueue_script( 'vr_scripts', VR_URL . '/assets/scripts.js', array('jquery'), VR_VERSION, true );
		
		wp_enqueue_style( 'plyr_css', 'https://cdn.plyr.io/3.6.12/plyr.css', array(), VR_VERSION );
		wp_enqueue_script( 'plyr_js', 'https://cdn.plyr.io/3.6.12/plyr.polyfilled.js', array('jquery'), VR_VERSION, true );
	
}
add_action( 'wp_enqueue_scripts', 'plyr_enqueue_scripts', 8 );

function video_module_save()
{
    if (!is_user_logged_in()) die();

    $videoUrl = $_POST['video'];
    $currentTime = $_POST['currentTime'];
    $user_id = get_current_user_id();

    update_user_meta($user_id, $videoUrl, $currentTime);
    die();
}

add_action('wp_ajax_nopriv_video_module_save', 'video_module_save');
add_action('wp_ajax_video_module_save', 'video_module_save');


function video_module_load()
{
    $videoUrl = $_GET['video'];
    if (empty($videoUrl)) die();

    $user_id = get_current_user_id();

    $currentTime = get_user_meta($user_id, $videoUrl, true);

    echo json_encode(array('seconds' => $currentTime));
    die();
}

add_action('wp_ajax_nopriv_video_module_load', 'video_module_load');
add_action('wp_ajax_video_module_load', 'video_module_load');

?>