class ImageParser {
  constructor(detectionType, apiResponse) {
    this.detectionType = detectionType;
    this.apiResponse = apiResponse;
  }

  parseImageData() {
    switch(this.detectionType) {
      case 'CELEBRITY_MODEL':
        break;
      case 'COLOR_MODEL':
        break;
      case 'FACE_DETECT_MODEL':
        return this.handleFaceDetection();
      case 'FOOD_MODEL':
        break;
      default:
        return [];
    }
  }

  handleFaceDetection() {
    const faces = [];
    const { regions: recognizedFaces } = this.apiResponse.outputs[0].data;
    for (let i = 0; i < recognizedFaces.length; i++) {
      const { bounding_box } = recognizedFaces[i].region_info;
      faces.push(this.buildReference(`Face ${i + 1}`, `Reference-${i + 1}`, bounding_box))
    };

    return faces;
  }

  buildReference(description, key, box) {
    return {
      description,
      key,
      box
    }
  }
}

module.exports = ImageParser;