class ImageParser {
  constructor(detectionType, apiResponse) {
    this.detectionType = detectionType;
    this.apiResponse = apiResponse;
  }

  parseImageData() {
    switch(this.detectionType) {
      case 'CELEBRITY_MODEL':
        return this.handleCelebrityDetection();
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

  handleCelebrityDetection() {
    const celebrities = [];
    const { regions: recognizedCelebrities } = this.apiResponse.outputs[0].data;
    for (let i = 0; i < recognizedCelebrities.length; i++) {
      const { region_info: { bounding_box }, data: faceData } = recognizedCelebrities[i];
      const { concepts: [mostAccurate, _] } = faceData.face.identity;
      celebrities.push(this.buildReference(`${mostAccurate.name} (${(mostAccurate.value * 100).toFixed(2)}%)`, `Reference-${i + 1}`, bounding_box))
    };

    return celebrities;
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