function sendNotify(caption, notificationType) {
    if (notificationType == undefined
        || notificationType == null) {
        notificationType = "";
}

var container = document.getElementById("notifyContainer");
var notify = document.createElement("div");
notify.className = `notification ${notificationType}`;
notify.innerText = caption;

container.appendChild(notify);

setTimeout(() => {
    notify.className += " dismissed";
    setTimeout(() => {
        container.removeChild(notify);
    }, 500);
}, 3000);
}
