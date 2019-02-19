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
        return this.handleColorDetection();
      case 'FACE_DETECT_MODEL':
        return this.handleFaceDetection();
      case 'FOOD_MODEL':
        return this.handleFoodDetection();
      default:
        return [];
    }
  }

  handleFoodDetection() {
    const foodIngredients = [];
    const { concepts: ingredients } = this.apiResponse.outputs[0].data;

    for (let i = 0; i < ingredients.length; i++) {
      const {name, value} = ingredients[i];
      foodIngredients.push(this.buildReference(`${name} (${(value * 100).toFixed(2)}%)`, `Ingredient-${i}`))
    }

    return foodIngredients;
  }

  handleColorDetection() {
    const recognizedColors = [];
    let { colors } = this.apiResponse.outputs[0].data;
    colors.sort((elem1, elem2) => elem2.value - elem1.value)
    
    for (let i = 0; i < colors.length; i++) {
      const { raw_hex, value, w3c : { name } } = colors[i];
      recognizedColors.push(this.buildReference(`${name} ${raw_hex} (${(value * 100).toFixed(2)}%)`, `${raw_hex}`))
    }

    return recognizedColors
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