<?php
/**
 * Hotelsuite API class 
 */
class HotelsuiteApi {

    private $accessToken;
    private $extensionConfiguration = [];
    
    protected  $endpoint;
    protected  $data;
    protected  $attemp = 0;
    protected $logger;
    protected $settings;

    public function __construct() 
    {
        // Load Settings 
        $this->extensionConfiguration = get_option( 'hsforms_api_option_name' );
    }

    /**
     * fetchData
     *
     * @return array $data
     */
    public function fetch($endpoint)
    {
        // endpoint url
        $url = $this->extensionConfiguration['api_url'] . $endpoint;
        // Get Access Token
        $this->accessToken = $this->getCurrentAccessToken();
        // have to fetch data from API with accessToken and endpoitn
        $this->data = $this->fetchData($url, $this->accessToken);

        return $this->data;
    }

    public function fetchData($endpoint = FALSE, $accessToken = FALSE)
    {
        
        if (!$endpoint || !$accessToken) {
            return;
        }
               
        // Prepare Headers for Request
        $headers= [
            'Authorization' => 'Bearer ' . $accessToken,
            'Accept' => 'application/vnd.hotel-suite.v1+json'
        ];

        if($this->extensionConfiguration['s8_key']) {
           $headers['X-S8Key'] = $this->extensionConfiguration['s8_key'];
        }

        $response  = wp_remote_get($endpoint, ['headers' => $headers]);
        $data = wp_remote_retrieve_body($response);

        // If a 403 status (error) is returned, try to get a new token (3-attemps)
        $statusCode = wp_remote_retrieve_response_code($response);

        if (($statusCode == '403' || $statusCode == '401') && $this->attemp < 3) {

            $this->attemp++;

            // Update Access token, and save new token in db
            $this->updateAccessToken();

            // Fetch again, using the new (updated) token from db
            $data = $this->fetchData($endpoint, $this->getCurrentAccessToken());

        } else if ($this->attemp >= 3) {
            $msg = 'API AUTHENTICATION ERROR: Invalid client_id or client_secret. Check extension configuration!';
            throw new Exception( $msg );
        }

        return $data;

    }


    /**
     * getCurrentAccessToken
     *
     * @return $string accessToken
     */
    public function getCurrentAccessToken() 
    {

        // Try to get existing token from DB
        $token = get_option('hsforms_api_token');
        if($token) {
            return $token;
        } else {
            $this->updateAccessToken();                 // Store new access token if not found
        }
    }

    /**
     * updateAccessToken
     *
     * @return void
     */
    public function updateAccessToken() 
    {

        $this->accessToken = $this->getNewAccessToken();

        // Save the new Token to DB
        if ($this->accessToken) {
            update_option('hsforms_api_token', $this->accessToken);
        }

    }

    /**
     * getNewAccessToken
     *
     * @return void
     */
    public function getNewAccessToken() 
    {

        $accessToken = false;

        $requestData = [
            'grant_type'    => 'client_credentials',
            'client_id'     => $this->extensionConfiguration['client_id'],
            'client_secret' => $this->extensionConfiguration['client_secret']
        ];
        
        $url = $this->extensionConfiguration['api_url'] . '/oauth';
        
        $headers = [
            'Accept' => 'application/json'
        ];

        $response = wp_remote_post($url, [
            'body' => $requestData,
            'headers' => $headers
        ]);
        $data = wp_remote_retrieve_body($response);
        $statusCode = wp_remote_retrieve_response_code($response);

        if ($statusCode != '200') {
            $msg = 'API AUTHENTICATION ERROR: ' . 'Title: ' . json_decode($data, TRUE)['title'] . '. Status: ' . json_decode($data, TRUE)['status'] . '. Details: ' . json_decode($data, TRUE)['detail'];
            throw new Exception( $msg );
        } else {
            $accessToken = json_decode($data, TRUE)['access_token'];
        }

        return $accessToken;
    }
}