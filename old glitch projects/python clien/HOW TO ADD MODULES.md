`mods.js` is the file where all the modules can be added/edited. It is the only thing that needs to be changed to add a new module.

Inside of the `mods` object, each module has an id which must be written like `moduleName` and not `"Module Name"` because it is a variable. Each id has an object inside it with properties: `name`, `description`, `category`, `imageURL`, and `URL`.

`category` might be something like "UI" or "Cosmetics".

`imageURL` is the url of the image used to descibe the pack. You can get the URL by clicking the file after adding it in Assets.

`URL` is the URL of the zip file of this pack. You can get this the same way as the image. It must contain all the contents directly after opening the zip, not in a folder. It does not need a manifest or pack_icon.png

USING `base.js`:

If you understand `mods.js`, this one is pretty simple. It is used to describe general information about the client.