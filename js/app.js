// get the input box for main comment
const mainComment = document.getElementById("myInput");

// to get the comment list conatiner so that we can use the evenet delegation
const commentList = document.getElementById("commentList");

// to add a new comment
let addComment = () => {
	if (!localStorage.getItem("comments")) {
		let comments = [];
		localStorage.setItem("comments", JSON.stringify(comments));
	}

	console.log(mainComment.value)
	comments = JSON.parse(localStorage.getItem("comments"));
	comments.push({
		parentCommentId: null,
		commentId: Math.random()
			.toString()
			.substr(2, 7),
		commentText: mainComment.value,
		childComments: [],
		Likes: 0
	});
	localStorage.setItem("comments", JSON.stringify(comments));
	finalCommentsViewPage();
	mainComment.value = "";
};

// create a reply button
let createReplyButtonCommentView = (id, operationType, commentOldData) => {
	let div = document.createElement("div");
	div.classList.add("action-container");
	div.setAttribute("data-parentId", id);
	div.innerHTML = `<input type="text" value="${
		operationType === "Update" ? commentOldData : ""
	}"> <button class="btn action-btn blue-btn">${operationType}</button>`;

	return div;
};
// genarate a single comment view card
let singleCommentCard = (obj, padding) => `
    <div class="single-comment-card" style="margin-left: ${padding}px;"data-parentId="${
	obj.parentCommentId
}" id="${obj.commentId}">
    ${obj.commentText}
		<div class="btns-container">
			<button class="btn action-btn blue-btn">Like</button><span class="info-text"> ${
				obj.Likes === 0 ? "" : obj.Likes
			}</span>
			<button class="btn action-btn green-btn">Reply</button><span class="info-text"> ${
						obj.childComments.length === 0 ? "" : obj.childComments.length
					}</span>
			<button class="btn action-btn green-btn"> Edit</button>
			<button class="btn action-btn red-btn"> Delete </button>
		</div>
        
    </div>
    `;
// a recursive method to generate a view if there are nested comment childrens
let createRecusiveView = (commentList, padding = 0) => {
	let fullView = "";
	for (let i of commentList) {
		fullView += singleCommentCard(i, padding);
		if (i.childComments.length > 0) {
			fullView += createRecusiveView(i.childComments, (padding += 20));
			padding -= 20;
		}
	}
	return fullView;
};
// recursive to increase the likes by 1
let increaseLikeByOne = (allComments, newCommentLikeId) => {
	for (let i of allComments) {
		if (i.commentId === newCommentLikeId) {
			i.Likes += 1;
		} else if (i.childComments.length > 0) {
			increaseLikeByOne(i.childComments, newCommentLikeId);
		}
	}
};

// final view to generate all the comments
let finalCommentsViewPage = () => {
	let allCommentsFromLocalStorage = JSON.parse(
		localStorage.getItem("comments")
	);
	if (allCommentsFromLocalStorage) {
		let allComments = createRecusiveView(allCommentsFromLocalStorage);
		commentList.innerHTML = allComments;
	}
};

finalCommentsViewPage();

// recursive method to push the new child comment
let addNewChildComment = (allComments, newComment) => {
	for (let i of allComments) {
		if (i.commentId === newComment.parentCommentId) {
			i.childComments.push(newComment);
		} else if (i.childComments.length > 0) {
			addNewChildComment(i.childComments, newComment);
		}
	}
};

// get all comments from local storage
let getAllComments = () => JSON.parse(localStorage.getItem("comments"));

// set comments object again in local storage
let setAllComments = allComments =>
	localStorage.setItem("comments", JSON.stringify(allComments));

// recursive method to update the comment
let updateComment = (allComments, updatedCommentId, updatedCommentText) => {
	for (let i of allComments) {
		if (i.commentId === updatedCommentId) {
			i.commentText = updatedCommentText;
		} else if (i.childComments.length > 0) {
			updateComment(i.childComments, updatedCommentId, updatedCommentText);
		}
	}
};

// recursive function for deleting a single comment
let deleteComment = (allComments, newCommentId) => {
	for (let i in allComments) {
		if (allComments[i].commentId === newCommentId) {
			allComments.splice(i, 1);
		} else if (allComments[i].childComments.length > 0) {
			deleteComment(allComments[i].childComments, newCommentId);
		}
	}
};
// Event delegation for "comment", "edit comment", "like", "Update" click and "add new child" comment in existing comments
commentList.addEventListener("click", e => {
	if (e.target.innerText === "Reply") {
		const currentParentComment = e.target.closest(".single-comment-card");
		const parentId =  currentParentComment.getAttribute("id");
		currentParentComment.appendChild(
			createReplyButtonCommentView(parentId, "Add Comment")
		);
		e.target.style.display = "none";
		e.target.nextSibling.style.display = "none";
	} else if (e.target.innerText === "Add Comment") {
		const currParentNode = e.target.closest(".action-container");
		const parentComment = e.target.closest(".single-comment-card");
		const parentId = currParentNode.getAttribute("data-parentId")
			? currParentNode.getAttribute("data-parentId")
			: parentComment.getAttribute("id");
		const newAddedComment = {
			parentCommentId: parentId,
			commentId: Math.random()
				.toString()
				.substr(2, 7),
			commentText: currParentNode.firstChild.value,
			childComments: [],
			Likes: 0
		};
		let allCommentsFromLocalStorage = getAllComments();
		addNewChildComment(allCommentsFromLocalStorage, newAddedComment);
		setAllComments(allCommentsFromLocalStorage);
		finalCommentsViewPage();
	} else if (e.target.innerText === "Like") {
		let allCommentsFromLocalStorage = getAllComments();
		increaseLikeByOne(allCommentsFromLocalStorage, e.target.closest(".single-comment-card").id);
		setAllComments(allCommentsFromLocalStorage);
		finalCommentsViewPage();
	} else if (e.target.innerText === "Edit") {
		const parentId = !e.target.parentNode.getAttribute("data-parentId")
			? e.target.parentNode.getAttribute("data-parentId")
			: e.target.parentNode.getAttribute("id");
		const currentParentComment = e.target.closest(".single-comment-card");
		const complateCommentText = currentParentComment.innerText;
		const commentToArray = complateCommentText.split("\n");const realComment = commentToArray[0];
		currentParentComment.appendChild(
			createReplyButtonCommentView(
				parentId,
				"Update",
				realComment
			)
		);
		e.target.style.display = "none";
	} else if (e.target.innerText === "Update") {
		const currParentNode = e.target.closest(".action-container");
		const parentComment = e.target.closest(".single-comment-card");
		const updatedComment = currParentNode.firstChild.value;
		const parentId = parentComment.getAttribute("id");

		let allCommentsFromLocalStorage = getAllComments();
		updateComment(
			allCommentsFromLocalStorage,
			parentId,
			updatedComment
		);
		setAllComments(allCommentsFromLocalStorage);
		finalCommentsViewPage();
	} else if (e.target.innerText === "Delete") {
		const parentId = e.target.closest(".single-comment-card").getAttribute("id");
		let allCommentsFromLocalStorage = getAllComments();
		deleteComment(allCommentsFromLocalStorage, parentId);
		setAllComments(allCommentsFromLocalStorage);
		finalCommentsViewPage();
	}
});
