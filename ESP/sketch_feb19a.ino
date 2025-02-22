#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <time.h>

// Wi-Fi credentials
#define WIFI_SSID "Varad"
#define WIFI_PASSWORD "varad1526"

// Firebase configuration
#define API_KEY ""
#define DATABASE_URL ""
#define USER_EMAIL ""
#define USER_PASSWORD ""

// Firestore configuration
#define FIRESTORE_PROJECT_ID "test-b67c6"
#define FIRESTORE_COLLECTION "sensor_logs"

// Sensor pins
#define DHT_PIN 21        // DHT22 Sensor
#define SOIL_MOISTURE_PIN 32  // Soil Moisture (Analog)
#define MQ135_PIN 34      // MQ-135 Sensor (Analog)
#define WATER_PUMP_PIN 4 // Water Pump Motor Control
#define DHT_TYPE DHT22    // DHT22 Sensor Type

// MQ-135 Constants
#define R0 4.45           // Pre-calibrated R0 value
#define DRY_VALUE 3500    // ADC value in dry soil
#define WET_VALUE 1000    // ADC value in wet soil
#define MOISTURE_THRESHOLD_LOW 60  // Threshold to turn ON pump
#define MOISTURE_THRESHOLD_HIGH 70 // Threshold to turn OFF pump

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// DHT Sensor
DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
    Serial.begin(115200);

    // Connect to Wi-Fi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to Wi-Fi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\n✅ Connected to Wi-Fi");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    // Initialize Firebase
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;
    auth.user.email = USER_EMAIL;
    auth.user.password = USER_PASSWORD;
  
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);

    while (!Firebase.ready()) {
        Serial.println("⌛ Connecting to Firebase...");
        delay(1000);
    }
    Serial.println("✅ Firebase Connected!");

    // Set up sensors
    pinMode(SOIL_MOISTURE_PIN, INPUT);
    pinMode(MQ135_PIN, INPUT);
    pinMode(WATER_PUMP_PIN, OUTPUT);
    digitalWrite(WATER_PUMP_PIN, LOW); // Ensure pump is off initially
    dht.begin();

    // Sync time with NTP
    configTime(0, 0, "pool.ntp.org");
}

void loop() {
    // Read sensor values
    float temp = dht.readTemperature();
    float humid = dht.readHumidity();
    
    // Read soil moisture and map to percentage
    int sensorValue = analogRead(SOIL_MOISTURE_PIN);
    int moisturePercent = map(sensorValue, DRY_VALUE, WET_VALUE, 0, 100);
    moisturePercent = constrain(moisturePercent, 0, 100);

    // Read MQ-135 sensor value and convert to PPM
    int mq135_raw = analogRead(MQ135_PIN);
    float mq135_ppm = calculatePPM(mq135_raw);

    // Generate timestamp
    String timestamp = getTimestamp();

    // Control water pump based on soil moisture level
    if (moisturePercent < MOISTURE_THRESHOLD_LOW) {
        digitalWrite(WATER_PUMP_PIN, HIGH); // Turn on pump
        Serial.println("🚰 Pump ON (Soil too dry)");
    } else if (moisturePercent > MOISTURE_THRESHOLD_HIGH) {
        digitalWrite(WATER_PUMP_PIN, LOW); // Turn off pump
        Serial.println("💧 Pump OFF (Soil sufficiently moist)");
    }

    // Print sensor values
    Serial.println("\n📡 Sensor Readings:");
    Serial.printf("🌡 Temperature: %.2f °C\n", temp);
    Serial.printf("💧 Humidity: %.2f %%\n", humid);
    Serial.printf("🌱 Soil Moisture: %d%%\n", moisturePercent);
    Serial.printf("🛢 MQ-135 (VOC PPM): %.2f ppm\n", mq135_ppm);
    Serial.printf("🕒 Timestamp: %s\n", timestamp.c_str());

    // Send to Firebase RTDB
    if (Firebase.RTDB.setFloat(&fbdo, "/sensor/temperature", temp) &&
        Firebase.RTDB.setFloat(&fbdo, "/sensor/humidity", humid) &&
        Firebase.RTDB.setInt(&fbdo, "/sensor/soil_moisture", moisturePercent) &&
        Firebase.RTDB.setFloat(&fbdo, "/sensor/mq135_ppm", mq135_ppm)) {
        Serial.println("✅ RTDB data sent successfully!");
    } else {
        Serial.printf("❌ RTDB error: %s\n", fbdo.errorReason().c_str());
    }

    // Send to Firestore
    if (sendToFirestore(temp, humid, moisturePercent, mq135_ppm, timestamp)) {
        Serial.println("✅ Firestore data sent successfully!");
    } else {
        Serial.printf("❌ Firestore error: %s\n", fbdo.errorReason().c_str());
    }

    delay(5000); // Wait 5 seconds before next reading
}

// Function to calculate PPM from MQ-135 sensor
float calculatePPM(int rawValue) {
    float sensorVoltage = rawValue * (3.3 / 4095.0);
    float rs = (3.3 - sensorVoltage) / sensorVoltage;
    float ratio = rs / R0;
    float ppm = 116.6020682 * pow(ratio, -2.769034857);
    return ppm;
}

// Function to get current timestamp
String getTimestamp() {
    time_t now;
    time(&now);
    char buf[64];
    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", localtime(&now));
    return String(buf);
}

// Function to send data to Firestore
bool sendToFirestore(float temp, float humid, int moisturePercent, float mq135_ppm, String timestamp) {
    FirebaseJson content;
    content.set("fields/temperature/doubleValue", temp);
    content.set("fields/humidity/doubleValue", humid);
    content.set("fields/soil_moisture/integerValue", moisturePercent);
    content.set("fields/mq135_ppm/doubleValue", mq135_ppm);
    content.set("fields/timestamp/stringValue", timestamp);

    return Firebase.Firestore.createDocument(&fbdo, FIRESTORE_PROJECT_ID, "", FIRESTORE_COLLECTION, content.raw());
}
