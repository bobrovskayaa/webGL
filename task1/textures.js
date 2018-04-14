function loadImage(url, callback) {
    let image = new Image();
    image.src = url;
    image.onload = function() {
        callback(image);
    };
    return image;
}

function loadImages(urls, callback) {
    let images = [];
    let imagesToLoad = urls.length;

    // вызывается каждый раз при загрузке изображения
    let onImageLoad = function() {
        --imagesToLoad;
        if (imagesToLoad == 0) {
            callback(images);
        }
    };

    for (let i = 0; i < imagesToLoad; ++i) {
        let image = loadImage(urls[i], onImageLoad);
        images.push(image);
    }
}

function processTexture(gl, images) {
    let textures = [];
    for (let i = 0; i < 2; ++i) {
        // создаём текстуру
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // задаём параметры, чтобы можно было отрисовать изображение любого размера
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // загружаем изображение в текстуру
        // gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, pixel
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
        textures.push(texture);
    }

    // привязываем текстуру к текстурному блоку
    for (let i = 0; i < textures.length; ++i) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
    }

    return textures;
}

function textureAnimation(gl, programInfo, t) {
    const u = Math.pow(Math.sin(t/3), 2);
    const v = Math.pow(Math.cos(t/3), 2);
    gl.uniform4fv(programInfo.uniformLocations.coef1, [u, u, u, 1]);
    gl.uniform4fv(programInfo.uniformLocations.coef0, [v, v, v, 1]);
}