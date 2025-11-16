import { supabase } from '../lib/supabase'

// 拉黑用户相关函数
export const blockUser = async (blockedUserId: string, reason?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  const { data, error } = await supabase
    .from('user_blocked_users')
    .insert({
      user_id: user.id,
      blocked_user_id: blockedUserId,
      reason: reason || null
    })

  if (error) throw error
  return data
}

export const unblockUser = async (blockedUserId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  const { error } = await supabase
    .from('user_blocked_users')
    .delete()
    .eq('user_id', user.id)
    .eq('blocked_user_id', blockedUserId)

  if (error) throw error
}

export const getBlockedUsers = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  const { data, error } = await supabase
    .from('user_blocked_users')
    .select(`
      blocked_user_id,
      blocked_at,
      reason,
      blocked_user:auth.users!user_blocked_users_blocked_user_id_fkey (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq('user_id', user.id)
    .order('blocked_at', { ascending: false })

  if (error) throw error
  return data
}

export const isUserBlocked = async (targetUserId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('user_blocked_users')
    .select('id')
    .eq('user_id', user.id)
    .eq('blocked_user_id', targetUserId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// 屏蔽标签相关函数
export const blockTag = async (tagId: string, reason?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  const { data, error } = await supabase
    .from('user_blocked_tags')
    .insert({
      user_id: user.id,
      tag_id: tagId,
      reason: reason || null
    })

  if (error) throw error
  return data
}

export const unblockTag = async (tagId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  const { error } = await supabase
    .from('user_blocked_tags')
    .delete()
    .eq('user_id', user.id)
    .eq('tag_id', tagId)

  if (error) throw error
}

export const getBlockedTags = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('用户未登录')

  const { data, error } = await supabase
    .from('user_blocked_tags')
    .select(`
      tag_id,
      blocked_at,
      reason,
      tag:tags (
        id,
        name,
        description
      )
    `)
    .eq('user_id', user.id)
    .order('blocked_at', { ascending: false })

  if (error) throw error
  return data
}

export const isTagBlocked = async (tagId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('user_blocked_tags')
    .select('id')
    .eq('user_id', user.id)
    .eq('tag_id', tagId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// 过滤内容函数
export const filterBlockedContent = async (posts: any[]) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return posts

  try {
    // 获取用户屏蔽列表
    const [blockedUsers, blockedTags] = await Promise.all([
      getBlockedUsers(),
      getBlockedTags()
    ])

    const blockedUserIds = (blockedUsers || [])
      .filter(bu => bu != null)
      .map(bu => {
        const item = bu as any;
        // Handle different possible data structures from Supabase
        if (typeof item === 'object' && item.blocked_user_id) {
          return item.blocked_user_id;
        }
        return item;
      })
      .filter(Boolean)
    const blockedTagIds = blockedTags.map(bt => bt.tag_id)

    // 过滤掉被屏蔽用户的内容和被屏蔽标签的内容
    return posts.filter(post => {
      // 过滤被屏蔽用户的内容
      if (blockedUserIds.includes(post.user_id)) return false
      
      // 过滤包含被屏蔽标签的内容
      if (post.tags && post.tags.some((tag: any) => blockedTagIds.includes(tag.id))) return false
      
      return true
    })
  } catch (error) {
    console.error('过滤屏蔽内容失败:', error)
    return posts
  }
}