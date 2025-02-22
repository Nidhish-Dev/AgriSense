#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <MQUnifiedsensor.h>
#include <time.h>

// Wi-Fi credentials
#define WIFI_SSID "OesterHostel_2.4G."
#define WIFI_PASSWORD "Hostel@FF"

// Firebase configuration
#define API_KEY ""
#define DATABASE_URL ""
#define USER_EMAIL ""
#define USER_PASSWORD ""

// Firestore configuration
#define FIRESTORE_PROJECT_ID "test-b67c6"
#define FIRESTORE_COLLECTION "sensor_logs"

// DHT sensor settings
#define DHT_PIN 4  // GPIO 4
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// MQ-2 sensor settings
#define MQ2_PIN 34  // GPIO 34 (Analog pin)
#define Board "ESP32"
#define Voltage_Resolution 3.3
#define ADC_Bit_Resolution 12
#define RatioMQ2CleanAir 9.83

MQUnifiedsensor mq2(Board, Voltage_Resolution, ADC_Bit_Resolution, MQ2_PIN, "MQ-2");

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Initialize Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Ensure Firebase is ready before proceeding
  while (!Firebase.ready()) {
    Serial.println("Connecting to Firebase...");
    delay(1000);
  }
  Serial.println("Firebase Connected!");

  // Initialize sensors
  dht.begin();
  mq2.init();
  mq2.setRegressionMethod(1);
  mq2.setA(574.25);
  mq2.setB(-2.222);
  mq2.calibrate(RatioMQ2CleanAir);
  
  configTime(0, 0, "pool.ntp.org"); // Sync with NTP server
}

void loop() {
  // Read temperature and humidity from DHT sensor
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Read gas concentration from MQ-2 sensor
  mq2.update();
  float gasConcentration = mq2.readSensor();

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");
  
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");

  Serial.print("Gas Concentration: ");
  Serial.print(gasConcentration);
  Serial.println(" ppm");

  // Send data to Firebase Realtime Database
  if (Firebase.RTDB.setFloat(&fbdo, "/sensor/temperature", temperature) &&
      Firebase.RTDB.setFloat(&fbdo, "/sensor/humidity", humidity) &&
      Firebase.RTDB.setFloat(&fbdo, "/sensor/gas", gasConcentration)) {
    Serial.println(" Data sent to Realtime Database!");
  } else {
    Serial.println(" Failed to send data to Realtime Database: " + fbdo.errorReason());
  }

  // Send data to Firestore
  sendToFirestore(temperature, humidity, gasConcentration);

  delay(2000); // Wait before next reading
}

void sendToFirestore(float temperature, float humidity, float gasConcentration) {
  FirebaseJson content;
  content.set("fields/temperature/doubleValue", String(temperature));
  content.set("fields/humidity/doubleValue", String(humidity));
  content.set("fields/gas/doubleValue", String(gasConcentration));
  content.set("fields/timestamp/stringValue", getTimestamp());

  // Create a unique document ID
  String documentPath = String(FIRESTORE_COLLECTION) + "/" + String(millis());

  if (Firebase.Firestore.createDocument(&fbdo, FIRESTORE_PROJECT_ID, "", documentPath.c_str(), content.raw())) {
    Serial.println(" Sensor data log sent to Firestore!");
  } else {
    Serial.println("Failed to send sensor data log to Firestore: " + fbdo.errorReason());
  }
}

String getTimestamp() {
  time_t now = time(nullptr);
  char buf[64];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", gmtime(&now));
  return String(buf);
}
