<script>
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
               // If we just answered a question, deselect it
               if (selectedQuestion && newComment.comment.includes(selectedQuestion.questionText)) {
                   selectedQuestion = null;
               }
           });
      
           // --- Listen for admin-specific Q&A events ---
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
      
       // Function to handle when an admin selects a question to answer
       function handleSelectQuestion(question) {
           selectedQuestion = question;
           toast('Question selected. Type your answer below.');
       }
   </script>
      
   <style>
   .commentary-container { max-width: 800px; margin: 2rem auto; padding: 2rem; background: #f9f9f9; border-radius: 8px; }
    .commentary-list { list-style: none; padding: 0; margin-top: 2rem; }
    .commentary-item { background: #fff; padding: 1rem; border-radius: 5px; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .comment-meta { font-size: 0.85rem; color: #666; margin-bottom: 0.5rem; }
    .comment-meta strong { color: #333; }
    .comment-body { font-size: 1rem; color: #222; }

    .kms-to-go {
        font-size: 1.2rem;
        font-weight: bold;
        color: #007bff;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
    }
   </style>
      
   <div class="commentary-container">
       <h1>Live Commentary</h1>
       <p>Updates will appear here automatically.</p>
      
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
               {#each comments.toReversed() as comment (comment.id)}
                   <li class="commentary-item">
                       {#if comment.kms_to_go !== null && comment.kms_to_go >= 0}
                           <h4 class="kms-to-go">{comment.kms_to_go} km to go</h4>
                       {/if}
                       <div class="comment-meta">
                           <strong>{comment.username}</strong> at {new Date(comment.created_at).toLocaleTimeString()}
                       </div>
                       <p class="comment-body">{comment.comment}</p>
                   </li>
               {/each}
           </ul>
       {/if}
   </div>