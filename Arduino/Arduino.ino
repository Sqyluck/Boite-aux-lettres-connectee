/* Définition des pins de l'ESP8266
RST     = D1
SDA(SS) = D2
MOSI    = D7
MISO    = D6
SCK     = D5
Echo    = D3
Trig    = D4
ServoMoteur = D8
*/

/** Bibliothéques **/

#include <ESP8266WiFi.h> // ESP8266
#include <SPI.h> // NFC
#include "MFRC522.h" // NFC
#include <ArduinoJson.h> // Constellation
#include <Constellation.h> // Constellation
#include <String.h> // String
#include <Servo.h> // ServoMoteur

/** Variables pour Internet et Constellation **/

const char ssid[]="SSID"; // SSID pour Internet
const char mdp[] = "MotDePasse"; // Mot de passe pour Internet

const char IP[] = "0.0.0.0.0"; // IP de l'ordinateur 
const int port = 8088; // Numéro du port utilisé
const char sentinel[] = "ESP8266"; // Sentinel Virtuelle
const char package[] = "ESP8266_Package"; // Package Virtuelle
const char cds[] = "CLEFDACCES"; // Clef d'accès


/** Attribution **/
Servo monServo; // ServoMoteur

#define RST_PIN  5  //  Modul D1 - NFC
#define SS_PIN  4  //  Modul D2 - NFC

const int TRIGGER = 2; // Modul D4 - Capteur Distance
const int ECHO = 0; // Modul D3 - Capteur Distance

/** Déclaration des constantes **/
int defaultValue = 5; // distance ente le capteur et la fente

/** Connexion à Constellation **/
Constellation<WiFiClient> constellation(IP, port , sentinel , package , cds);

/** Lancement du NFC **/

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance

/************************Fonctions*******************************/

// Permet de transformer un tableau de bit en String
String dump_byte_array(byte *buffero, byte bufferSize) {
  String str[bufferSize];
  String so;
  for (byte i = 0; i < bufferSize; i++) {
    str[i]= String(buffero[i], HEX);
    so += str[i];
  }
  return(so);
}

// Code global pour l'utilisation du NFC
void NFC() { 
  // Regarde s'il y a une nouvelle carte, s'il n'y en a pas on quitte la fonction
  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    return;
  }
  // S'il n'arrive pas à lire la carte on quitte la fonction
  if ( ! mfrc522.PICC_ReadCardSerial()) {
    return;
  }
  Serial.print(F("Card UID:"));
  char sochar[256];
  String UID= dump_byte_array(mfrc522.uid.uidByte, mfrc522.uid.size);
  UID.toCharArray(sochar, 256);
  constellation.sendMessage(Package, "Brain", "Authorisation", sochar);
  /* envoie un message Callback du package Brain appelé Authorisation */
  Serial.println(UID);
}

void setup(){
  pinMode(TRIGGER, OUTPUT);
  digitalWrite(TRIGGER, LOW); // La broche TRIGGER doit être à LOW au repos
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  monServo.attach(15); 

  // Connection au Wifi  
  WiFi.begin(ssid, mdp);  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  // Pour la WifI attendre 3 secondes
  delay(3000);
 
  Serial.println("WiFi connected. IP: ");
  Serial.println(WiFi.localIP());
  constellation.declarePackageDescriptor();
    delay(50);
  Serial.println(F("Booting...."));
  
  SPI.begin();           // Initialisation du bus SPI 
  Serial.println("Scan PICC to see UID and type...");
  mfrc522.PCD_Init();    // Initialisation du MFRC522
  
  Serial.println(F("Ready!"));
  Serial.println(F("======================================================")); 
  Serial.println(F("Scan for Card and print UID:"));
  NFC();
  monServo.write(0);
  
  constellation.registerStateObjectLink("*", "Brain", "ActivateMotor", [](JsonObject& so) {
    delay(100); // délai afin d'attendre la connexion à Constellation
    if (so["Value"]== true){   
      Serial.println("porte ouverte");
      monServo.write(90);  // Position de la porte ouverte
      }
    if (so["Value"]== false){
      Serial.println("porte fermee");
      monServo.write(0);   // Position de la porte fermée
      }
      delay(3000); // attendre au minimum 3 secs avant que la porte ne change d'état.
  });  
}


void loop(){
  
  /* 1. Lance une mesure de distance en envoyant une impulsion HIGH de 10µs sur la broche TRIGGER */
  digitalWrite(TRIGGER, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIGGER, LOW);
  
  /* 2. Mesure le temps entre l'envoi de l'impulsion ultrasonique et son écho (si il existe) */
  long measure = pulseIn(ECHO, HIGH);
   
  /* 3. Calcul la distance à partir du temps mesuré */
  long distanceMeasured = measure / 58.2;
  if(distanceMeasured < defaultValue){
    /* 4.Affiche les résultats en mm, cm et m */
    Serial.print(" Distance: ");
    Serial.print(distanceMeasured);
    Serial.print(" cm ");
    Serial.println("");
    constellation.sendMessage(Package, "Brain", "Message", "[ Message ]");
  }
  constellation.loop();
  NFC();
  }
