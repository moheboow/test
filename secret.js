var firebaseConfig = {
    apiKey: "AIzaSyBEtXBiFXnk3jPmb6wdfW4SOvMXJQIjCzg",
    authDomain: "saraha-5e7fd.firebaseapp.com",
    databaseURL: "https://saraha-5e7fd-default-rtdb.firebaseio.com/",
    projectId: "saraha-5e7fd",
    storageBucket: "saraha-5e7fd.appspot.com",
    messagingSenderId: "942089850758",
    appId: "1:942089850758:web:bc767461bc426a904e2607"
};
const app = firebase.initializeApp(firebaseConfig);
const firestore = app.firestore();


if (firebase.messaging.isSupported()) {
    messaging = app.messaging();
}
// Replace with your actual Firebase Cloud Messaging server key
const serverKey = "AAAA21juT4Y:APA91bEUomQIsA6OcAaQI8lxcstgH4RMVrLyD4vgoU_lTqrO86vrCEJ1sT-f6e8IS0zacaQ8_jYXVCxVLfUiOb8ZA9kvci4NA1kGl1f32Ybx--DCIhFL5itdZl7eWb-iX_nyxHhc3ktP";



function getURLParameter(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Fetch the user ID from the URL
var username = getURLParameter('user_id');


function getInputVal(id) {
    return document.getElementById(id).value;
}

// Add an event listener to the input field or textarea that triggers focus
document.getElementById('contact-form').addEventListener('submit', submitForm);


// Assuming you have a reference to the contact-form element
function submitForm(e) {
    e.preventDefault();

    // Get the input values within the submitForm function
    var name = getInputVal('name');
    var message = getInputVal('message'); // Get the message input value

    console.log('Name:', name);
    console.log('Message:', message);


    // Show the loading dialog
    var loadingDialog = document.getElementById('loading-dialog');
    if (loadingDialog) {
        loadingDialog.style.display = 'block';
    }

    // Set a 5-second delay for demonstration purposes
    setTimeout(function () {
        // Call the saveMessage function with the name and message values
        saveMessage(name, message);
    }, 4000); // 4000 milliseconds (4 seconds) delay
}


function fetchUserIdByUsername(username) {
    return new Promise(function (resolve, reject) {
        // Reference to Firestore collection
        var usersCollection = firebase.firestore().collection('users');

        // Query Firestore to find the user with the given username
        usersCollection.where('username', '==', username).limit(1).get()
            .then(function (querySnapshot) {
                if (!querySnapshot.empty) {
                    // User with the given username found, get the user ID
                    var doc = querySnapshot.docs[0];
                    var userId = doc.id;
                    console.log('User ID for username', username, 'is', userId);
                    resolve(userId); // Resolve the promise with the userId
                } else {
                    reject(new Error('User not found')); // Reject the promise if the user is not found
                }
            })
            .catch(function (error) {
                console.error('Error fetching user document:', error);
                reject(error);
            });
    });
}


// Initialize Firestore
//var db = firebase.firestore();
// Function to increment or create the visits field
function incrementVisitsCount(userId) {
    var userDocRef = firestore.collection('users').doc(userId);

    // Check if the document exists
    userDocRef.get()
        .then(function (doc) {
            if (doc.exists) {
                // Document exists, update the visits field
                var existingVisits = doc.data().visitsCount || 0;
                userDocRef.update({
                    visitsCount: existingVisits + 1
                })
                    .then(function () {
                        // Visits field updated successfully
                        console.log('Visits updated successfully');
                    })
                    .catch(function (error) {
                        console.error("Error updating visits:", error);
                    });
            } else {
                // Document doesn't exist, create it with visits field
                userDocRef.set({
                    visitsCount: 1
                })
                    .then(function () {
                        // Document and visits field created successfully
                        console.log('Document and visits field created successfully');
                    })
                    .catch(function (error) {
                        console.error("Error creating document and visits field:", error);
                    });
            }
        })
        .catch(function (error) {
            console.error("Error checking document existence:", error);
        });
}



// Example usage:
fetchUserIdByUsername(username)
    .then(function (userId) {
        // Use the retrieved userId here
        console.log('User ID is', userId);

        // Reference to Firestore collection
        var usersCollection = firebase.firestore().collection('users');

        // Reference to the specific user document
        var userDocRef = usersCollection.doc(userId);

        // Fetch the user's name and set it as the placeholder for the textarea
        userDocRef.get()
            .then(function (doc) {
                if (doc.exists) {
                    var userName = doc.data().name;
                    var bio = doc.data().status;
                    var profilePhoto = doc.data().photoUrl;

                    var visitsCount = doc.data().visitsCount || 0; // Initialize to 0 if not present

                    // Update the visitsCount field in your HTML
                    document.getElementById('visits').textContent = `Visits : ${visitsCount}`;

                    // ... rest of your code for displaying user information

                    // Call the function with the user's userId
                    incrementVisitsCount(userId);

                    if (profilePhoto) {
                        var profilePhotoElement = document.getElementById('profilePhoto');
                        profilePhotoElement.src = `${profilePhoto}`;
                    } else {
                        // Handle the case where the username is not found
                        document.getElementById('profilePhoto').style.display = `none`;

                    }


                    if (bio) {
                        var bioElement = document.getElementById('bio');
                        bioElement.innerHTML = `&ldquo;${bio}&rdquo;`;
                    } else {
                        // Handle the case where the username is not found
                        document.getElementById('bio').textContent = ` Be Honest `;
                    }

                    if (userName) {
                        // Update the textarea's placeholder with the retrieved username
                        var messageElement = document.getElementById('message');
                        messageElement.placeholder = `Type your message to "${userName}" send privately here...`;
                        document.getElementById('userName').textContent = `${userName}`;
                    } else {
                        // Handle the case where the username is not found
                        document.getElementById('message').placeholder = `Type your message to this user...`;
                        document.getElementById('userName').textContent = ` Be Honest `;
                    }
                } else {
                    // Handle the case where the user document is not found
                    console.error("User document not found in Firestore");
                }
            })
            .catch(function (error) {
                console.error("Error fetching user document:", error);
            });
    })
    .catch(function (error) {
        console.error('Error:', error.message);
        document.getElementById('message').placeholder = `Something went wrong...`;
        document.getElementById('bio').textContent = `Oops`;
        document.getElementById('userName').textContent = ` Be Honest `;
        document.getElementById('profilePhoto').style.display = `none`;

        var submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
        }
        var invalidUserIdToast = document.getElementById('invalid-user-id-toast');
        if (invalidUserIdToast) {
            invalidUserIdToast.style.display = 'block';
            // Hide the toast message after 3 seconds (3000 milliseconds)
            setTimeout(function () {
                invalidUserIdToast.style.display = 'none';
            }, 3000);
        }
    });




function saveMessage(name, message) {
    fetchUserIdByUsername(username)
        .then(function (userId) {
            // Use the retrieved userId here
            console.log('User ID is', userId);
            // You can place the rest of your code here
            // Reference to Firestore collection
            var userMessagesCollection = firebase.firestore().collection('users').doc(userId).collection('secrets');
            // Get the current timestamp (milliseconds since epoch) for the message
            var messageTimestamp = Date.now();

            // Create a message object to save in Firestore
            var messageData = {
                name: name,
                message: message,
                timestamp: messageTimestamp, // Add the timestamp to the message data
                isNew: true,
                isPinned: false
            };

            // Add the message to Firestore
            userMessagesCollection.add(messageData)
                .then(function (docRef) {
                    console.log("Message saved successfully with ID: ", docRef.id);
                    // Show the loading dialog
                    var loadingDialog = document.getElementById('loading-dialog');
                    if (loadingDialog) {
                        loadingDialog.style.display = 'none';
                    }
                    showSuccessToast(); // Show the success toast message
                    // Call the function to reset the character counter to 500
                    updateCharacterCount();
                    document.getElementById('contact-form').reset();
                    sendNotificationToUser(userId);
                    // You can add any code here that you want to run after a successful save
                    // For example, you can clear the message input field or display a success message.
                })
                .catch(function (error) {
                    console.error("Error saving message:", error);
                });


        })
        .catch(function (error) {
            console.error('Error:', error.message);

        });
}




function updateCharacterCount() {
    var textarea = document.getElementById('message');
    var charCount = document.getElementById('char-count');
    var maxLength = 500;
    var remainingChars = maxLength - textarea.value.length;
    charCount.textContent = 'Max : ' + remainingChars;
}

// Function to show the success toast message
function showSuccessToast() {
    var toastMessage = document.getElementById('toast-message');
    toastMessage.style.display = 'block';
    // Hide the toast message after 3 seconds (3000 milliseconds)
    setTimeout(function () {
        toastMessage.style.display = 'none';
    }, 2500); // Change 3000 to the desired toast display duration in milliseconds (3 seconds)
}

// Function to insert the selected emoji into the input field at the cursor position
function sendemoji(emoji) {
    var messageInput = document.getElementById('message');
    var startPos = messageInput.selectionStart;
    var endPos = messageInput.selectionEnd;
    var text = messageInput.value;
    var newText = text.substring(0, startPos) + emoji + text.substring(endPos, text.length);
    messageInput.value = newText;
    messageInput.focus();
    messageInput.setSelectionRange(startPos + emoji.length, startPos + emoji.length);
}

//send notification
function sendNotificationToUser(userId) {
    // Reference to Firestore collection
    var usersCollection = firebase.firestore().collection('users');

    // Fetch the user's FCM token and notificationsOn status from Firestore
    usersCollection.doc(userId).get()
        .then(function (doc) {
            if (doc.exists) {
                var userFCMToken = doc.data().token;
                var notificationsOn = doc.data().notificationsOn;

                if (notificationsOn === true && userFCMToken) {
                    // Create the notification object with custom vibration
                    const notification = {
                        to: userFCMToken, // FCM token from Firestore
                        notification: {
                            title: "New Message",
                            body: "You have a new message from a friend!",
                        },
                    };
                    sendNotification(notification);
                } else {
                    // Handle the case where notifications are turned off or FCM token is not found
                    console.log("Notifications are turned off for the user or FCM token not found.");
                }
            } else {
                // Handle the case where the user document does not exist in Firestore
                console.error("User document not found in Firestore");
            }
        })
        .catch(function (error) {
            console.error("Error fetching user document:", error);
        });
}



// Function to send the notification (you can define this elsewhere in your code)
function sendNotification(notification) {
    const options = {
        method: "POST",
        headers: {
            Authorization: `key=${serverKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
    };
    fetch("https://fcm.googleapis.com/fcm/send", options).then((response) => response.json()).then((data) => {
        console.log("Successfully sent notification:", data);
    }).catch((error) => {
        console.error("Error sending notification:", error);
    });
}
// end send notification