#define MQ_PIN 34  // ESP32 ADC pin connected to MQ-135
#define RL_VALUE 10.0  // Load resistance in kilo-ohms (adjust based on circuit)
#define RO 11.03 // Your calibrated Ro value in kilo-ohms
#define ADC_MAX 4095  // ESP32 ADC resolution (12-bit)
#define V_REF 3.3  // ESP32 reference voltage

// Gas curve parameters for VOCs (estimated from datasheet)
#define VOC_CURVE_A 110.0  // Scaling factor
#define VOC_CURVE_B -2.862  // Exponent (log-log relationship)

// Function to get sensor resistance
float getSensorResistance(int raw_adc) {
    float sensor_volt = (raw_adc / (float)ADC_MAX) * V_REF;  // Convert ADC value to voltage
    float RS = (V_REF - sensor_volt) / sensor_volt * RL_VALUE;  // Calculate sensor resistance
    return RS;
}

// Function to calculate VOC concentration (PPM)
float getVOC_PPM() {
    int raw_adc = analogRead(MQ_PIN);  // Read sensor value
    float RS = getSensorResistance(raw_adc);  // Get sensor resistance
    float ratio = RS / RO;  // RS/R0
    float ppm = VOC_CURVE_A * pow(ratio, VOC_CURVE_B);  // VOC PPM using power function
    return ppm;
}

void setup() {
    Serial.begin(115200);
    delay(2000);  // Allow sensor to stabilize
    Serial.println("VOC Measurement Started...");
}

void loop() {
    float voc_ppm = getVOC_PPM();  // Get VOC reading
    Serial.print("VOC Concentration: ");
    Serial.print(voc_ppm);
    Serial.println(" PPM");
    
    delay(2000);  // Wait before next reading
}
