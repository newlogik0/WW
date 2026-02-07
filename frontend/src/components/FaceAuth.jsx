import { useState, useRef, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, Loader2, UserCheck, X, RefreshCw, ScanFace } from "lucide-react";

const MODEL_URL = "/models";

export default function FaceAuth({ mode = "login", onSuccess, onCancel, username = "" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedDescriptor, setCapturedDescriptor] = useState(null);
  const streamRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        toast.success("Face recognition ready");
      } catch (error) {
        console.error("Failed to load face models:", error);
        toast.error("Failed to load face recognition models");
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();

    return () => {
      // Cleanup camera on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Could not access camera. Please allow camera permissions.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setFaceDetected(false);
    setCapturedDescriptor(null);
  };

  // Detect face and get descriptor
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    setDetecting(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (detection) {
        setFaceDetected(true);
        setCapturedDescriptor(Array.from(detection.descriptor));
        
        // Draw detection on canvas
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetection);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
        
        toast.success("Face detected! Ready to proceed.");
      } else {
        setFaceDetected(false);
        setCapturedDescriptor(null);
        
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        toast.info("No face detected. Please position your face in the frame.");
      }
    } catch (error) {
      console.error("Face detection error:", error);
      toast.error("Face detection failed. Please try again.");
    } finally {
      setDetecting(false);
    }
  }, [cameraActive]);

  // Handle submit (login or register)
  const handleSubmit = () => {
    if (!capturedDescriptor) {
      toast.error("Please capture your face first");
      return;
    }
    
    onSuccess(capturedDescriptor, username);
  };

  // Handle cancel
  const handleCancel = () => {
    stopCamera();
    if (onCancel) onCancel();
  };

  if (isLoading) {
    return (
      <Card className="bg-[#1a1a1a] border-[#333333]">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 text-[#00d9ff] animate-spin mx-auto mb-4" />
          <p className="text-[#b3b3b3]">Loading face recognition...</p>
        </CardContent>
      </Card>
    );
  }

  if (!modelsLoaded) {
    return (
      <Card className="bg-[#1a1a1a] border-[#333333]">
        <CardContent className="p-8 text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">Failed to load face recognition models</p>
          <Button 
            variant="outline" 
            className="mt-4 border-[#333333]"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#333333]" data-testid="face-auth-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <ScanFace className="w-5 h-5 text-[#00d9ff]" />
          {mode === "login" ? "Face Login" : "Register Face"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video/Camera View */}
        <div className="relative aspect-video bg-[#0d0d0d] rounded-lg overflow-hidden border border-[#333333]">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${!cameraActive ? "hidden" : ""}`}
            data-testid="face-auth-video"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />
          
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Camera className="w-16 h-16 text-[#333333] mb-4" />
              <p className="text-[#808080] text-sm text-center px-4">
                Click "Start Camera" to begin face {mode === "login" ? "login" : "registration"}
              </p>
            </div>
          )}
          
          {/* Status indicator */}
          {cameraActive && (
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
              faceDetected 
                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            }`}>
              {faceDetected ? "Face Detected" : "Looking for face..."}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          {!cameraActive ? (
            <Button
              onClick={startCamera}
              className="flex-1 bg-[#00d9ff] hover:bg-[#33e0ff] text-[#0d0d0d] font-semibold"
              data-testid="start-camera-btn"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button
                onClick={detectFace}
                disabled={detecting}
                className="flex-1 bg-[#00d9ff] hover:bg-[#33e0ff] text-[#0d0d0d] font-semibold"
                data-testid="capture-face-btn"
              >
                {detecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <ScanFace className="w-4 h-4 mr-2" />
                    Capture Face
                  </>
                )}
              </Button>
              
              <Button
                onClick={stopCamera}
                variant="outline"
                className="border-[#333333] text-[#b3b3b3] hover:bg-[#262626]"
                data-testid="stop-camera-btn"
              >
                <X className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Submit/Cancel */}
        {faceDetected && capturedDescriptor && (
          <div className="flex gap-3 pt-2 border-t border-[#333333]">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold"
              data-testid="face-auth-submit-btn"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              {mode === "login" ? "Login with Face" : "Register Face"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-[#333333] text-[#b3b3b3] hover:bg-[#262626]"
              data-testid="face-auth-cancel-btn"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="text-[#808080] text-xs space-y-1 pt-2">
          <p>• Position your face clearly within the frame</p>
          <p>• Ensure good lighting on your face</p>
          <p>• Remove sunglasses or face coverings</p>
        </div>
      </CardContent>
    </Card>
  );
}
