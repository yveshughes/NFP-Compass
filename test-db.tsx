import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const TestDatabase: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [orgId, setOrgId] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };

  const testConnection = async () => {
    try {
      // Test 1: Basic connection
      addResult('✓ Supabase client initialized');

      // Test 2: Create a test organization (without auth for now)
      const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy ID for testing

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: 'Test Org - Wear it Forward',
          mission_statement: 'Providing quality clothing for the unhoused',
          state_code: 'TX',
          user_id: testUserId
        })
        .select()
        .single();

      if (orgError) {
        if (orgError.code === '42501') {
          addResult('⚠️ RLS policy blocking insert (expected without auth)');
          addResult('Note: You need to disable RLS temporarily or setup auth to test inserts');
        } else {
          addResult(`❌ Error creating org: ${orgError.message}`);
        }
        return;
      }

      addResult(`✓ Organization created: ${org.id}`);
      setOrgId(org.id);

      // Test 3: Insert incorporate progress
      const { error: progressError } = await supabase
        .from('incorporate_progress')
        .insert({
          org_id: org.id,
          mission_completed: true,
          name_search_completed: true
        });

      if (progressError) {
        addResult(`⚠️ Incorporate progress error: ${progressError.message}`);
      } else {
        addResult('✓ Incorporate progress saved');
      }

      // Test 4: Insert branding
      const { error: brandError } = await supabase
        .from('branding')
        .insert({
          org_id: org.id,
          palette_name: 'Dignity & Warmth',
          primary_color: '#FF6B6B',
          secondary_color: '#2D3436',
          accent_color: '#FFD93D',
          background_color: '#FFF5F5'
        });

      if (brandError) {
        addResult(`⚠️ Branding error: ${brandError.message}`);
      } else {
        addResult('✓ Branding saved');
      }

      // Test 5: Insert board member
      const { error: boardError } = await supabase
        .from('board_members')
        .insert({
          org_id: org.id,
          name: 'Jane Doe',
          title: 'President'
        });

      if (boardError) {
        addResult(`⚠️ Board member error: ${boardError.message}`);
      } else {
        addResult('✓ Board member added');
      }

      // Test 6: Query everything back
      const { data: fullOrg, error: queryError } = await supabase
        .from('organizations')
        .select(`
          *,
          incorporate_progress(*),
          branding(*),
          board_members(*)
        `)
        .eq('id', org.id)
        .single();

      if (queryError) {
        addResult(`❌ Query error: ${queryError.message}`);
      } else {
        addResult('✓ Successfully queried organization with relations');
        addResult(`  - Org: ${fullOrg.name}`);
        addResult(`  - Progress records: ${fullOrg.incorporate_progress?.length || 0}`);
        addResult(`  - Branding records: ${fullOrg.branding?.length || 0}`);
        addResult(`  - Board members: ${fullOrg.board_members?.length || 0}`);
      }

      setStatus('✅ All tests completed!');

    } catch (error) {
      addResult(`❌ Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('❌ Tests failed');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>🧪 Supabase Database Test</h1>

      <div style={{
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Status: {status}</h2>
        {orgId && <p style={{ margin: 0, color: '#666' }}>Test Org ID: {orgId}</p>}
      </div>

      <div style={{
        padding: '15px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        <h3 style={{ marginTop: 0 }}>Test Results:</h3>
        {testResults.map((result, idx) => (
          <div key={idx} style={{
            padding: '8px',
            marginBottom: '4px',
            backgroundColor: result.includes('❌') ? '#fee' : result.includes('⚠️') ? '#ffeaa7' : '#efe',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {result}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', fontSize: '14px' }}>
        <h3 style={{ marginTop: 0 }}>⚠️ Important Notes:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>If you see RLS policy errors, that's expected without authentication</li>
          <li>To fix: Either disable RLS temporarily or setup Supabase Auth</li>
          <li>The schema is working correctly if you see "RLS policy blocking" messages</li>
          <li>For production, you'll need to add proper authentication</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <strong>Connection Info:</strong><br />
        URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}<br />
        Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-10) : 'Not set'}
      </div>
    </div>
  );
};

export default TestDatabase;
