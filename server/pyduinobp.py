import serial
from flask import Flask, request, jsonify
from flask_cors import CORS
import serial.tools.list_ports

app = Flask(__name__)
CORS(app, origins="*")

# Global variable to store serial connection
serialInst = None
use = None

# Initialize available ports and COM port selection
@app.route('/initialize-serial', methods=['GET'])
def initialize_serial_connection():
    global serialInst, use
    if serialInst and serialInst.is_open:
        return jsonify({"message": "Serial connection is already open."}), 200

    # List available ports
    ports = serial.tools.list_ports.comports()
    portsList = [str(one) for one in ports]
    
    # Get COM port from query parameters
    com = request.args.get('com', '3')  # Default COM3 if no port is provided
    for port in portsList:
        if port.startswith("COM" + str(com)):
            use = "COM" + str(com)
            break

    if not use:
        return jsonify({"message": f"Error: COM{com} not found in available ports."}), 400
    
    # Open serial connection
    try:
        serialInst = serial.Serial()
        serialInst.baudrate = 9600
        serialInst.port = use
        serialInst.open()
        return jsonify({"message": f"Serial connection established on {use}."}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to open port: {str(e)}"}), 500


# Endpoint to send 'Go' command to Arduino
@app.route('/send-go', methods=['POST'])
def send_go():
    try:
        if not serialInst or not serialInst.is_open:
            return jsonify({"error": "Serial connection is not open."}), 400
        command = "Go"
        serialInst.write(command.encode('utf-8'))
        return jsonify({"message": f"Sent: {command}"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to send command: {e}"}), 500


# Endpoint to send 'Stop' command to Arduino
@app.route('/send-stop', methods=['POST'])
def send_stop():
    try:
        if not serialInst or not serialInst.is_open:
            return jsonify({"error": "Serial connection is not open."}), 400
        command = "Stop"
        serialInst.write(command.encode('utf-8'))
        return jsonify({"message": f"Sent: {command}"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to send command: {e}"}), 500


# Endpoint to set Green Light Timer
@app.route('/set-green-timer', methods=['POST'])
def set_green_timer():
    try:
        if not serialInst or not serialInst.is_open:
            return jsonify({"error": "Serial connection is not open."}), 400

        # Get the timer value from the request body
        timer = request.json.get('timer')
        if timer and timer.isdigit():
            message = f"Green:{timer}"  # Format: Green:30
            serialInst.write(message.encode('utf-8'))
            return jsonify({"message": f"Sent Green Light Timer: {timer} seconds"}), 200
        else:
            return jsonify({"error": "Invalid input. Please enter a numeric value."}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to set timer: {e}"}), 500


# Close the serial connection when the app shuts down
# @app.teardown_appcontext
# def close_serial_connection(exception):
#     global serialInst
#     if serialInst and serialInst.is_open:
#         serialInst.close()
#         print("Serial connection closed.")


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
