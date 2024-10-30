<?php

// hsforms shortcode
function hsforms_shortcode($atts) {
    // hotelsuite api settings
	$apiOptions = get_option( 'hsforms_api_option_name' );
	
	// hsforms settings
	$hsforms_options = get_option( 'hsforms_options_option_name' );
	$ibeDefault = $hsforms_options['ibe_link'];
	$ibeFinalUrl = (isset($atts['ibeurl'])) ? $atts['ibeurl'] : $ibeDefault;
	$startDate = (isset($atts['startdate'])) ? date('Y-m-d', strtotime($atts['startdate'])) : date('Y-m-d');
	$endDate = (isset($atts['enddate'])) ? date('Y-m-d', strtotime($atts['enddate'])) : date('Y-m-d',strtotime(date("Y-m-d", time()) . " + 365 day"));
	$minNights = (isset($atts['minnights'])) ? $atts['minnights'] : (isset($hsforms_options['minimum_nights']) ? $hsforms_options['minimum_nights'] : '1');
	$minAdults = (isset($atts['minadults'])) ? $atts['minadults'] : (isset($hsforms_options['minimum_adults']) ? $hsforms_options['minimum_adults'] : '1');
	$maxAdults = (isset($atts['maxadults'])) ? $atts['maxadults'] : (isset($hsforms_options['maximum_adults']) ? $hsforms_options['maximum_adults'] : '1');
	$minKinder = (isset($atts['minkinder'])) ? $atts['minkinder'] : (isset($hsforms_options['minimum_kinder']) ? $hsforms_options['minimum_kinder'] : '1');
	$maxKinder = (isset($atts['maxkinder'])) ? $atts['maxkinder'] : (isset($hsforms_options['maximum_kinder']) ? $hsforms_options['maximum_kinder'] : '1');
	$maxKinderAge = (isset($atts['maxKinderAge'])) ? $atts['maxKinderAge'] : $hsforms_options['maximum_kinder_age'];
	$minRooms = (isset($atts['minrooms'])) ? $atts['minrooms'] : (isset($hsforms_options['minimum_rooms']) ? $hsforms_options['minimum_rooms'] : '1');
	$maxRooms = (isset($atts['maxrooms'])) ? $atts['maxrooms'] : (isset($hsforms_options['maximum_rooms']) ? $hsforms_options['maximum_rooms'] : '1');
	$btnLabel = (isset($atts['btnlabel'])) ? $atts['btnlabel'] : (isset($hsforms_options['btnLabel']) ? $hsforms_options['btnLabel'] : '');
	$allowedParams = (isset($atts['allowedparams']) && trim($atts['allowedparams'])) ? $atts['allowedparams'] : $hsforms_options['allowedParams'];
	$promocode = (isset($atts['promocode']) && trim($atts['promocode'])) ? $atts['promocode'] : '';
	$modalTitle = (isset($atts['modaltitle']) && trim($atts['modaltitle'])) ? $atts['modaltitle'] : '';
	$blockId = (isset($atts['id'])) ? $atts['id'].'_'.rand() : time();
	$extps = (isset($atts['extps'])) ? $atts['extps'] : false;
	$minLOSBuffer = (isset($atts['minlosbuffer'])) ? $atts['minlosbuffer'] : false;
	$isButton = (isset($atts['isbutton'])) ? $atts['isbutton'] : false;
	$keepParams = (isset($atts['keepparams'])) ? $atts['keepparams'] : (isset($hsforms_options['keepParams']) ? $hsforms_options['keepParams'] : false );
	$promocodeFlag = (isset($atts['promocodeflag'])) ? $atts['promocodeflag'] : (isset($hsforms_options['promocodeFlag']) ? $hsforms_options['promocodeFlag'] : false );
	$addRoomFlag = (isset($atts['addroomflag'])) ? $atts['addroomflag'] : (isset($hsforms_options['addRoomFlag']) ? $hsforms_options['addRoomFlag'] : false );
	$ratecodeFlag = (isset($atts['ratecodeflag'])) ? $atts['ratecodeflag'] : (isset($hsforms_options['ratecodeFlag']) ? $hsforms_options['ratecodeFlag'] : false );
	$segmentFlag = (isset($atts['segmentflag'])) ? $atts['segmentflag'] : (isset($hsforms_options['segmentFlag']) ? $hsforms_options['segmentFlag'] : false );
	$legendFlag = (isset($atts['legendflag'])) ? $atts['legendflag'] : (isset($hsforms_options['legendFlag']) ? $hsforms_options['legendFlag'] : false );
    $daysAllowed = (isset($atts['daysallowed'])) ? explode(',', $atts['daysallowed']) : [1,1,1,1,1,1,1];
    
	// now have to convert to Su,Mo,Tu,We,Th,Fr,Sa from Mo,Tu,We,Th,Fr,Sa,Su
	array_unshift($daysAllowed, $daysAllowed[6]);
	unset($daysAllowed[7]);

	// allowedParams array
	$allowedParamsForJS = [];
	foreach(explode(',',$allowedParams) as $param) {
		if(trim($param))
			$allowedParamsForJS[] = $param;
    }

    // get and prepare tps
	$tp_raw_data = (isset($atts['tps'])) ? $atts['tps'] : [];
	$tps = [];
	$bufferMinLengthOfStay = (!$minLOSBuffer) ? $minNights : '0'; // todo: with buffer flag it can be 0 or minLOS
	if($extps) {
		$today = new \DateTime('now');
		foreach($tp_raw_data as $tp) {
			$tp_start = get_post_meta($tp['value'], 'tp_start');
			$tp_end = get_post_meta($tp['value'], 'tp_end');
			if(is_array($tp_start)) {
				$tp_start = DateTime::createFromFormat('Y-m-d', $tp_start[0]);
			}
			if(is_array($tp_end)) {
				$tp_end = DateTime::createFromFormat('Y-m-d', $tp_end[0]);
			}
			$tp_end = $tp_end->add(\DateInterval::createfromdatestring($bufferMinLengthOfStay . ' day'));
			$today->add(\DateInterval::createfromdatestring($bufferMinLengthOfStay . ' day'));

			if(strtotime($tp_end->format('d-m-Y')) >= strtotime($today->format('d-m-Y'))) {
				if($tp_start->diff($tp_end)->days >= $minNights) {
					$tps[] = [$tp_start->format('Y-m-d'), $tp_end->format('Y-m-d')];
				}
			}
		}
	} else {
		if(!$bufferMinLengthOfStay) {
			$bufferMinLengthOfStay = '0';
		}
		$tp_start = DateTime::createFromFormat('Y-m-d', $startDate);
		$tp_end = DateTime::createFromFormat('Y-m-d', $endDate);
		$tp_end = $tp_end->add(\DateInterval::createfromdatestring($bufferMinLengthOfStay . ' day'));
		$tps[] = [$tp_start->format('Y-m-d'), $tp_end->format('Y-m-d')];
	}

	// get selected ratecodes
	$rc_raw_data = (isset($atts['ratecodes'])) ? $atts['ratecodes'] : [];
	$rcs = [];
	foreach($rc_raw_data as $rc) {
		$rcs[] = get_post_meta($rc['value'], 'ratecode');

	}

	// get selected segments
	$sg_raw_data = (isset($atts['segments'])) ? $atts['segments'] : [];
	$sgs = [];
	foreach($sg_raw_data as $sg) {
		$sgs[] = [$sg['label'], get_post_meta($sg['value'], 'code')[0]];
	}

	// using fluid template engine: https://github.com/TYPO3/Fluid
	require __DIR__ . '/view_init.php';
    
	// setting Action Name in RenderingContext so to pick up the right template
	if($view) {
		$view->getRenderingContext()->setControllerAction('Index');
		$view->assignMultiple([
			'blockId' => $blockId,
			'translations' => [
				'minRange' => __("Minrange message", "wordpress-hsforms"),
				'maxRange' => __("Maxrange message", "wordpress-hsforms"),
				'dateRange' => __("Daterange message", "wordpress-hsforms"),
				'arrivalDay' => __("Arrival day is not allowed", "wordpress-hsforms"),
				'maxpersonsmsg' => __("sorry too many persons", "wordpress-hsforms"),
				'dateFormat' => __("DD.MM.YYYY", "wordpress-hsforms"),
				'locale' => __('de', 'wordpress-hsforms'),
				'dateFromLabel' => __('From:', 'wordpress-hsforms'),
				'dateToLabel' => __('To:', 'wordpress-hsforms'),
				'adultsLabel' => __('Adults:', 'wordpress-hsforms'),
				'kinderLabel' => __('Children:', 'wordpress-hsforms'),
				'year' => __('Jahr', 'wordpress-hsforms'),
				'years' => __('Jahre', 'wordpress-hsforms'),
				'under' => __('Unter', 'wordpress-hsforms'),
				'segmentLabel' => __('Segment', 'wordpress-hsforms'),
				'segmentDefaultLabel' => __('Select Segment', 'wordpress-hsforms'),
				'promocodeLabel' => __('Promotion Code', 'wordpress-hsforms'),
				'ratecodeLabel' => __('Rate Code', 'wordpress-hsforms'),
				'removeLinkLabel' => __('Remove', 'wordpress-hsforms'),
				'addLinkLabel' => __('Add Room', 'wordpress-hsforms'),
				'kinderAgeLabel' => __('Age of Child:', 'wordpress-hsforms'),
			],
			'minAdults' => $minAdults,
			'maxAdults' => $maxAdults,
			'minKinder' => $minKinder,
			'maxKinder' => $maxKinder,
			'maxKinderAge' => array_fill( 0, $maxKinderAge, null),
			'minPersons' => $minKinder + $minAdults,
			'maxPersons' => $maxKinder + $maxAdults,
			'minRooms' => $minRooms,
			'maxRooms' => $maxRooms,
			'minNights' => $minNights,
			'daysAllowed' => $daysAllowed,
			'keepParams' => $keepParams,
			'allowedParams' => $allowedParamsForJS,
			'tps' => $tps,
			'ibeFinalUrl' => $ibeFinalUrl,
			'minRoomsIterator' => range(1, $minRooms),
			'hiddenRoomsIterator' => range($minRooms+1, $maxRooms),
			'segments' => $sgs,
			'promocode' => $promocode,
			'promocodeFlag' => $promocodeFlag,
			'ratecodes' => $rcs,
			'btnLabel' => $btnLabel,
			'addRoomFlag' => $addRoomFlag,
			'ratecodeFlag' => $ratecodeFlag,
			'segmentFlag' => $segmentFlag,
			'legendFlag' => $legendFlag,
			'isButton' => $isButton,
			'modalTitle' => $modalTitle
		]);
		if(isset($apiOptions['enable_api'])) {
			$view->assign('enableAPI', 1);
			if($legendFlag) {
				$hsApi = new HotelsuiteApi();
				$colorsConfig = json_decode($hsApi->fetch('/web-availability-color-config'));
				if(is_array($colorsConfig->_embedded->web_availability_color_config)) {
					$view->assign('colorConfig', $colorsConfig->_embedded->web_availability_color_config[0]);
				}
			}
		}
		$output = $view->render();
	} else {
		error_log('I think you forgot to run composer install for hsforms.');
		$output = "Please check the error in debug.log";
	}

	return $output;
}
// adds a shortcode for hsforms
add_shortcode('hsforms', 'hsforms_shortcode');