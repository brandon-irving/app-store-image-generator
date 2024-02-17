const JSZip = require("jszip");
const sharp = require("sharp");
const fs = require("fs").promises;
const { join } = require("path");
const os = require("os");

const iosSizes = [
	{ width: 2732, height: 2048 },
	{ width: 2208, height: 1242 },
	{ width: 2796, height: 1290 },
];
const androidSizes = [
	{ width: 1024, height: 500 },
	{ width: 320, height: 3840 },
	{ width: 1080, height: 7680 },
];

async function resizeAndZipImages(
	images,
	includeIOS = true,
	includeAndroid = true,
) {
	const masterZip = new JSZip();

	if (includeIOS) {
		const iosFolder = masterZip.folder("ios");
		for (const size of iosSizes) {
			const sizeFolder = iosFolder.folder(`${size.width}x${size.height}`);
			for (const imagePath of images) {
				const fileName = join(imagePath).split("/").pop();
				const image = await sharp(imagePath)
					.resize(size.width, size.height)
					.toBuffer();
				sizeFolder.file(fileName, image);
			}
		}
	}

	if (includeAndroid) {
		const androidFolder = masterZip.folder("android");
		for (const size of androidSizes) {
			const sizeFolder = androidFolder.folder(
				`${size.width}x${size.height}`,
			);
			for (const imagePath of images) {
				const fileName = join(imagePath).split("/").pop();
				const image = await sharp(imagePath)
					.resize(size.width, size.height)
					.toBuffer();
				sizeFolder.file(fileName, image);
			}
		}
	}

	const masterZipBuffer = await masterZip.generateAsync({
		type: "nodebuffer",
	});
	const desktopDir = os.homedir() + "/Desktop";
	const masterZipName = `resized-images-${Date.now()}.zip`;
	const masterZipPath = join(desktopDir, masterZipName);

	await fs.writeFile(masterZipPath, masterZipBuffer);
	return masterZipPath;
}

// Function to call from the renderer process
async function handleImageResizeAndZip(images, includeIOS, includeAndroid) {
	try {
		const savedPath = await resizeAndZipImages(
			images,
			includeIOS,
			includeAndroid,
		);
		// Open the directory containing the saved zip file
		require("electron").shell.showItemInFolder(savedPath);
	} catch (error) {
		console.error("Error processing images:", error);
	}
}

module.exports = { handleImageResizeAndZip };

