<?php

namespace Lazytask\Controller;

use Lazytask\Helper\Lazytask_DatabaseTableSchema;
use Lazytask\Helper\Lazytask_SlugGenerator;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

final class Lazytask_SettingController {

	public function get_settings(WP_REST_Request $request)
	{
		$settings = get_option('lazytask_settings', []);
		return new WP_REST_Response([
			'status'=>200,
			'data'=>$settings,
		], 200);
	}

	public function update_settings(WP_REST_Request $request)
	{


		$requestData = $request->get_body_params();
		$settings = isset($requestData['settings']) ? json_decode($requestData['settings'], true) : [];

		if (!is_array($settings)) {
			return new WP_Error('invalid_settings', $settings, ['status' => 400]);
		}
		$oldSettings = get_option('lazytask_settings', []);
		$oldCoreSettings = json_decode($oldSettings['core_setting'], true);
		if(isset($settings['type']) && $settings['type'] !=''){

			if( $settings['type'] =='general') {
				//wp_handle_upload site_logo

				$requestFile = $request->get_file_params();


				if( isset($requestFile['site_logo']) && $requestFile['site_logo'] !=''){
					require_once(ABSPATH . 'wp-admin/includes/file.php');
					$uploadedfile = $requestFile['site_logo'];
					$upload_overrides = array( 'test_form' => false );
					$movefile = wp_handle_upload( $uploadedfile, $upload_overrides );
					if ( $movefile && !isset( $movefile['error'] ) ) {
						$settings['core_setting']['site_logo'] = $movefile['url'];
					} else {
						$settings['core_setting']['site_logo'] = isset($oldCoreSettings['site_logo']) ? $oldCoreSettings['site_logo'] : '';
					}
				}else{
					$settings['core_setting']['site_logo'] = isset($oldCoreSettings['site_logo']) ? $oldCoreSettings['site_logo'] : '';
				}

				$settings['core_setting'] = json_encode($settings['core_setting']);
			}elseif( $settings['type'] =='notification' ) {
				$settings['notification_setting'] = json_encode($settings['notification_setting']);
			}elseif($settings['type'] =='smtp') {
				$settings['smtp_configuration'] = json_encode($settings['smtp_configuration']);
			}elseif($settings['type'] =='sms' ) {
				$settings['sms_configuration'] = json_encode($settings['sms_configuration']);
			}elseif($settings['type'] =='firebase' ) {
				$settings['firebase_configuration'] = json_encode($settings['firebase_configuration']);
			}
		}


		update_option('lazytask_settings', $settings);


		$getSettings = get_option('lazytask_settings', []);


		return new WP_REST_Response([
			'status'=>200,
			'message'=>'Settings update successfully',
			'data'=>$getSettings,
			'requestData'=>$settings
		], 200);
	}

	public function getLazytaskConfig()
	{

		$getLazytasksConfig = get_option('lazytasks_config');
		$lazytask_do_activation_redirect = get_option('lazytask_do_activation_redirect');

		$data = json_decode($getLazytasksConfig, true);
		$data['lazytask_do_activation_redirect'] = $lazytask_do_activation_redirect;

		return new WP_REST_Response(
			[
				'status' => 200,
				'message' => 'Lazytask Config',
				'data' => $data
			]

		);
	}

	public function updateLazytaskConfig( WP_REST_Request $request )
	{

		$requestData = $request->get_json_params();

		$option_value = get_option('lazytasks_config', []);
		$data = json_decode($option_value, true);

		if (isset($requestData['step_completed'])) {
			$data['step_completed'] = $requestData['step_completed'];
		}

		if (isset($requestData['lazytasks_basic_info_guide_modal'])) {
			$data['lazytasks_basic_info_guide_modal'] = $requestData['lazytasks_basic_info_guide_modal'];
		}

		if (isset($requestData['lazytask_do_activation_redirect'])) {
			update_option('lazytask_do_activation_redirect', $requestData['lazytask_do_activation_redirect']);
		}

		update_option('lazytasks_config', json_encode($data));

		$getLazytasksConfig = get_option('lazytasks_config');
		$afterUpdateData = json_decode($getLazytasksConfig, true);
		$afterUpdateData['lazytask_do_activation_redirect'] = get_option('lazytask_do_activation_redirect');

		return new WP_REST_Response(
			[
				'status' => 200,
				'message' => 'Lazytask Config',
				'data' => $afterUpdateData,
				'requestData' => $requestData
			]

		);
	}


}