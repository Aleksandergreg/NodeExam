<script>
    import '../../styles/LiveCommentaryPage.css';
    import { onMount } from 'svelte';
    import io from 'socket.io-client';
    import { fetchGet } from '../../utils/fetchApi.js';
    import { user as userStore } from '../../stores/authStore.js';
    import { toast } from 'svelte-5-french-toast';
    import CommentaryInput from '../../components/Commentary/CommentaryInput.svelte';
    import QuestionAskForm from '../../components/Commentary/QuestionAskForm.svelte';
    import AdminQuestionQueue from '../../components/Commentary/AdminQuestionQueue.svelte';

    let { stageId } = $props();
    let comments = $state([]);
    let isLoading = $state(true);
    let user = $state(null);
    let socket = $state(null);
    let pendingQuestions = $state([]);
    let selectedQuestion = $state(null);
    userStore.subscribe(value => user = value);
    function parseComment(commentText) {
        const qaRegex = /^Q: "(.+?)"\s*\n\s*A: (.*)$/s;
        const match = commentText.match(qaRegex);
        if (match) {
            return {
                isQA: true,
                question: match[1],
                answer: match[2]
            };
        }
        return {
            isQA: false,
            text: commentText
        };
    }
    async function fetchHistory() {
        try {
            comments = await fetchGet(`/commentary/${stageId}`);
        } catch (error) {
            toast.error("Could not load comment history.");
        } finally {
            isLoading = false;
        }
    }
    onMount(() => {
        fetchHistory();
        socket = io("http://localhost:8080", { withCredentials: true });
        socket.on('connect', () => {
            socket.emit('join_race_room', stageId);
        });
        socket.on('new_commentary_update', (newComment) => {
            comments = [...comments, newComment];
            if (selectedQuestion && newComment.comment.includes(selectedQuestion.questionText)) {
                selectedQuestion = null;
            }
        });
        if (user?.role === 'admin') {
            socket.on('admin_question_queue', (questions) => {
                pendingQuestions = questions;
            });
            socket.on('new_question_for_admin', (newQuestion) => {
                pendingQuestions = [...pendingQuestions, newQuestion];
            });
        }
        return () => {
            socket.emit('leave_race_room', stageId);
            socket.disconnect();
        };
    });
    function handleSelectQuestion(question) {
        selectedQuestion = question;
        toast('Question selected. Type your answer below.');
    }
</script>

<div class="card commentary-container">
    <h1>Live Commentary</h1>
    <p class="subtitle">Updates will appear here automatically.</p>
    
    {#if user}
        {#if user.role === 'admin'}
            <div class="admin-section">
                <CommentaryInput {stageId} {socket} questionToAnswer={selectedQuestion} />
                <AdminQuestionQueue questions={pendingQuestions} onSelectQuestion={handleSelectQuestion} />
            </div>
        {:else}
            <QuestionAskForm {socket} raceId={stageId} />
        {/if}
    {/if}
    
    {#if isLoading}
        <p>Loading commentary...</p>
    {:else}
        <ul class="commentary-list">
            {#if comments.length === 0}
                <li class="card empty-list">No commentary yet.</li>
            {/if}
            {#each comments as comment (comment.id)}
                {@const parsed = parseComment(comment.comment)}
                <li class="commentary-item card">
                    {#if comment.kms_to_go !== null && comment.kms_to_go >= 0}
                        <h4 class="kms-to-go">{comment.kms_to_go} km to go</h4>
                    {/if}
                    <div class="comment-meta">
                        <strong>{comment.username}</strong> at {new Date(comment.created_at).toLocaleTimeString()}
                    </div>
                    <div class="comment-body">
                        {#if parsed.isQA}
                            <div class="qa-block">
                                <div class="qa-question">
                                    <span class="qa-question-label">Q:</span>
                                    <span>"{parsed.question}"</span>
                                </div>
                                <div class="qa-answer">
                                    <p>{parsed.answer}</p>
                                </div>
                            </div>
                        {:else}
                            <p>{parsed.text}</p>
                        {/if}
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>