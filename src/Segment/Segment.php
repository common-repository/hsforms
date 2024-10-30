<?php

function hsforms_cptui_register_my_cpts_segment() {

	/**
	 * Post Type: Segment.
	 */

	$labels = [
		"name" => __( "Segment", "twentytwenty" ),
		"singular_name" => __( "TravelPeriod", "twentytwenty" ),
		"menu_name" => __( "Segment", "twentytwenty" ),
		"all_items" => __( "All Segment", "twentytwenty" ),
		"add_new" => __( "Add new", "twentytwenty" ),
		"add_new_item" => __( "Add new TravelPeriod", "twentytwenty" ),
		"edit_item" => __( "Edit TravelPeriod", "twentytwenty" ),
		"new_item" => __( "New TravelPeriod", "twentytwenty" ),
		"view_item" => __( "View TravelPeriod", "twentytwenty" ),
		"view_items" => __( "View Segment", "twentytwenty" ),
		"search_items" => __( "Search Segment", "twentytwenty" ),
		"not_found" => __( "No Segment found", "twentytwenty" ),
		"not_found_in_trash" => __( "No Segment found in trash", "twentytwenty" ),
		"parent" => __( "Parent TravelPeriod:", "twentytwenty" ),
		"featured_image" => __( "Featured image for this TravelPeriod", "twentytwenty" ),
		"set_featured_image" => __( "Set featured image for this TravelPeriod", "twentytwenty" ),
		"remove_featured_image" => __( "Remove featured image for this TravelPeriod", "twentytwenty" ),
		"use_featured_image" => __( "Use as featured image for this TravelPeriod", "twentytwenty" ),
		"archives" => __( "TravelPeriod archives", "twentytwenty" ),
		"insert_into_item" => __( "Insert into TravelPeriod", "twentytwenty" ),
		"uploaded_to_this_item" => __( "Upload to this TravelPeriod", "twentytwenty" ),
		"filter_items_list" => __( "Filter Segment list", "twentytwenty" ),
		"items_list_navigation" => __( "Segment list navigation", "twentytwenty" ),
		"items_list" => __( "Segment list", "twentytwenty" ),
		"attributes" => __( "Segment attributes", "twentytwenty" ),
		"name_admin_bar" => __( "TravelPeriod", "twentytwenty" ),
		"item_published" => __( "TravelPeriod published", "twentytwenty" ),
		"item_published_privately" => __( "TravelPeriod published privately.", "twentytwenty" ),
		"item_reverted_to_draft" => __( "TravelPeriod reverted to draft.", "twentytwenty" ),
		"item_scheduled" => __( "TravelPeriod scheduled", "twentytwenty" ),
		"item_updated" => __( "TravelPeriod updated.", "twentytwenty" ),
		"parent_item_colon" => __( "Parent TravelPeriod:", "twentytwenty" ),
	];

	$args = [
		"label" => __( "Segment", "twentytwenty" ),
		"labels" => $labels,
		"description" => "",
		"public" => true,
		"publicly_queryable" => true,
		"show_ui" => true,
		"show_in_rest" => true,
		"rest_base" => "",
		"rest_controller_class" => "WP_REST_Posts_Controller",
		"has_archive" => false,
		"show_in_menu" => false,
		"show_in_nav_menus" => false,
		"delete_with_user" => false,
		"exclude_from_search" => false,
		"capability_type" => "post",
		"map_meta_cap" => true,
		"hierarchical" => false,
		"rewrite" => [ "slug" => "segment", "with_front" => true ],
		"query_var" => true,
		"supports" => [ "title", "editor", "custom-fields" ],
	];

	register_post_type( "segment", $args );
}

add_action( 'init', 'hsforms_cptui_register_my_cpts_segment' );
add_action( 'add_meta_boxes', 'hsforms_cd_meta_box_add_segment' );

function hsforms_cd_meta_box_add_segment()
{
	add_meta_box(
		'sg-box',
		'Segment Code',
		'hsforms_meta_box_sg',
		'segment',
		'side' );
}
function hsforms_meta_box_sg()
{
	include plugin_dir_path( __FILE__ ) . '/sg.php';
}


/**
 * Save meta box content.
 *
 * @param int $post_id Post ID
 */
function hsforms_sg_save_meta_box( $post_id ) {
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( $parent_id = wp_is_post_revision( $post_id ) ) {
        $post_id = $parent_id;
    }
    $fields = [
        'code',
    ];
    foreach ( $fields as $field ) {
        if ( array_key_exists( $field, $_POST ) ) {
            update_post_meta( $post_id, $field, sanitize_text_field( $_POST[$field] ) );
        }
     }
}
add_action( 'save_post', 'hsforms_sg_save_meta_box' );

// add custom columns for segment

add_filter('manage_segment_posts_columns', 'hsforms_sg_table_head');
function hsforms_sg_table_head( $defaults ) {
	$defaults['date']  = __('Date created', 'wordpress-hsforms');
    $defaults['code']  = __('Segment Code', 'wordpress-hsforms');
    return $defaults;
}

// filling up the custom columns

add_action( 'manage_segment_posts_custom_column', 'hsforms_sg_table_content', 10, 2 );

function hsforms_sg_table_content( $column_name, $post_id ) {
    if ($column_name == 'code') {
		echo get_post_meta( $post_id, 'code', true );
    }
}


add_action( 'rest_api_init', function () {
    register_rest_field( 'code', 'code', array(
        'get_callback' => function( $post_arr ) {
            return get_post_meta( $post_arr['id'], 'code', true );
        },
    ) );
} );
